import { useState, useEffect } from 'react'
import './App.css'
import btnExcel from './assets/btn_excel.png'
import btnSet from './assets/btn_set.png'
import { exportToExcel, loadSheetJS } from './utils/excelExport'
import { importFromExcel } from './utils/excelImport'
import { showAlert, showSuccessToast, showLoadingToast, hideLoadingToast } from './utils/alertUtils'
import WorkRuleModal from './components/WorkRuleModal'
import HelpModal from './components/HelpModal'
import SettingsDrawer from './components/SettingsDrawer'

function App() {
  const [currentMonth, setCurrentMonth] = useState('')
  const [daysInMonth, setDaysInMonth] = useState(0)
  const [tableRows, setTableRows] = useState(() => {
    const savedRows = localStorage.getItem('tableRows')
    return savedRows ? JSON.parse(savedRows) : []
  })
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isWorkRuleModalOpen, setIsWorkRuleModalOpen] = useState(false)
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false)
  
  // 근무일 제한 설정 (localStorage에서 불러오기)
  const [workRules, setWorkRules] = useState(() => {
    const savedRules = localStorage.getItem('workRules')
    return savedRules ? JSON.parse(savedRules) : {
      dailyLimits: {
        D: 1,
        E: 1,
        N: 1,
        '/': 1
      },
      enableDailyLimit: true,
      calculationMethod: 'sum', // 'sum' 또는 'exclude_off'
      conflictRules: [] // 근무 충돌 방지 규칙
    }
  })

  // workRules가 변경될 때마다 localStorage에 저장
  useEffect(() => {
    localStorage.setItem('workRules', JSON.stringify(workRules))
  }, [workRules])

  // tableRows가 변경될 때마다 localStorage에 저장
  useEffect(() => {
    localStorage.setItem('tableRows', JSON.stringify(tableRows))
  }, [tableRows])

  useEffect(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1 // getMonth()는 0부터 시작하므로 +1
    
    // 해당 월의 일 수 계산
    const days = new Date(year, month, 0).getDate()
    
    setCurrentMonth(month)
    setDaysInMonth(days)
    
    // 저장된 테이블 데이터가 없을 때만 초기 행 추가
    if (tableRows.length === 0) {
      setTableRows([createEmptyRow(days)])
    }
  }, [])

  // 빈 행 생성 함수
  const createEmptyRow = (days) => {
    const row = {
      id: Date.now(),
      selected: false,
      name: '',
      workDays: 0,
      dates: {}
    }
    
    // 날짜별 데이터 초기화
    for (let i = 1; i <= days; i++) {
      row.dates[i] = ''
    }
    
    return row
  }

  // 행 추가
  const addRow = () => {
    const newRow = createEmptyRow(daysInMonth)
    setTableRows([...tableRows, newRow])
  }

  // 각 행의 D, E, N, OFF 개수 계산 및 근무일 계산
  const calculateCounts = (row) => {
    const counts = { d: 0, e: 0, n: 0, off: 0 }
    
    Object.values(row.dates).forEach(value => {
      switch(value) {
        case 'D':
          counts.d++
          break
        case 'E':
          counts.e++
          break
        case 'N':
          counts.n++
          break
        case '/':
          counts.off++
          break
      }
    })
    
    return counts
  }

  // 근무일 계산 (설정에 따라)
  const calculateWorkDays = (row) => {
    const counts = calculateCounts(row)
    
    if (workRules.calculationMethod === 'sum') {
      // D + E + N 합계로 계산
      return counts.d + counts.e + counts.n
    } else {
      // 전체 일수에서 OFF 일수를 제외
      return daysInMonth - counts.off
    }
  }

  // 일일 제한 체크 함수 (특정 날짜에 해당 근무 타입을 몇 명이 선택했는지)
  const canSelectWorkType = (rowIndex, day, newValue) => {
    if (!workRules.enableDailyLimit || !newValue) return true
    
    // 해당 날짜에 해당 근무 타입을 선택한 사람 수 카운트
    let currentCount = 0
    
    tableRows.forEach((row, idx) => {
      if (idx !== rowIndex && row.dates[day] === newValue) {
        currentCount++
      }
    })
    
    // 새로 선택하려는 값을 추가했을 때의 개수
    const newCount = currentCount + 1
    const limit = workRules.dailyLimits[newValue]
    
    return newCount <= limit
  }

  // 근무 충돌 체크 함수
  const checkWorkConflict = (rowIndex, day, newValue) => {
    // 근무를 선택하지 않거나 OFF 근무이거나 충돌 규칙이 없으면 충돌 없음
    if (!newValue || newValue === '/' || !workRules.conflictRules || workRules.conflictRules.length === 0) {
      return { hasConflict: false }
    }
    
    const currentEmployee = tableRows[rowIndex]?.name?.trim()
    if (!currentEmployee) {
      return { hasConflict: false }
    }
    
    // 현재 근무자와 충돌 관계에 있는 근무자들 찾기
    const conflictEmployees = []
    workRules.conflictRules.forEach(rule => {
      if (rule.employee1 === currentEmployee && rule.employee2) {
        conflictEmployees.push(rule.employee2)
      } else if (rule.employee2 === currentEmployee && rule.employee1) {
        conflictEmployees.push(rule.employee1)
      }
    })
    
    if (conflictEmployees.length === 0) {
      return { hasConflict: false }
    }
    
    // 해당 날짜에 충돌 근무자가 같은 유형의 근무를 선택했는지 확인
    const conflictingEmployee = tableRows.find((row, idx) => {
      if (idx === rowIndex) return false // 자기 자신 제외
      const employeeName = row.name?.trim()
      const selectedWork = row.dates[day]
      
      return conflictEmployees.includes(employeeName) && 
             selectedWork === newValue // 같은 근무 유형인 경우만 충돌
    })
    
    if (conflictingEmployee) {
      return {
        hasConflict: true,
        conflictEmployee: conflictingEmployee.name,
        conflictWork: conflictingEmployee.dates[day]
      }
    }
    
    return { hasConflict: false }
  }

  // Excel 내보내기 함수
  const handleExcelExport = async () => {
    try {
      // SheetJS 라이브러리가 로드되지 않았다면 로드
      await loadSheetJS()
      
      // 테이블이 비어있는지 확인
      if (tableRows.length === 0) {
        showAlert('내보낼 데이터가 없습니다.', 'warning')
        return
      }
      
      // 엑셀 파일 생성 및 다운로드
      const fileName = exportToExcel(tableRows, currentMonth, daysInMonth)
      
      // 성공 알림 표시
      showSuccessToast(`${fileName} 파일이 다운로드되었습니다!`)
      
    } catch (error) {
      console.error('엑셀 내보내기 오류:', error)
      showAlert('엑셀 파일 내보내기 중 오류가 발생했습니다. 다시 시도해주세요.', 'error')
    }
  }

  // Excel 불러오기 함수
  const handleExcelImport = async () => {
    try {
      // 로딩 상태 표시를 위한 토스트 생성
      const loadingToast = showLoadingToast('Excel 파일을 처리하고 있습니다...')
      
      const result = await importFromExcel(currentMonth, daysInMonth)
      
      // 로딩 토스트 제거
      hideLoadingToast(loadingToast)
      
      if (result.success) {
        // 현재 데이터가 있는지 확인
        const hasData = tableRows.length > 0 && tableRows.some(row => 
          row.name.trim() !== '' || Object.values(row.dates).some(date => date !== '')
        )
        
        if (hasData) {
          // 기존 데이터가 있으면 덮어쓸지 확인
          const shouldOverwrite = confirm(
            `현재 작업 중인 데이터가 있습니다.\n` +
            `Excel 파일(${result.fileName})을 불러오면 기존 데이터가 모두 대체됩니다.\n\n` +
            `계속하시겠습니까?`
          )
          
          if (!shouldOverwrite) {
            return
          }
        }
        
        // 데이터 설정
        setTableRows(result.data)
        
        // 성공 메시지 표시
        showSuccessToast(
          `${result.fileName} 파일이 성공적으로 불러와졌습니다! (${result.rowCount}명의 데이터)`
        )
        
        // 설정 메뉴 닫기
        setIsMenuOpen(false)
        
      } else {
        // 오류 메시지 표시
        showAlert(`Excel 파일 불러오기 실패:\n${result.error}`, 'error')
      }
      
    } catch (error) {
      console.error('Excel 불러오기 오류:', error)
      showAlert('Excel 파일을 불러오는 중 예상치 못한 오류가 발생했습니다.', 'error')
    }
  }

  const deleteRow = () => {
    const selectedRows = tableRows.filter(row => row.selected)
    
    if (selectedRows.length === 0) {
      // 선택된 행이 없으면 알림 표시
      showAlert('삭제할 행을 선택해주세요', 'warning')
      return
    }
    
    // 선택된 행들 삭제
    const remainingRows = tableRows.filter(row => !row.selected)
    if (remainingRows.length === 0) {
      // 모든 행이 삭제된 경우 빈 행 하나 추가
      setTableRows([createEmptyRow(daysInMonth)])
    } else {
      setTableRows(remainingRows)
    }
  }

  // 초기화
  const resetTable = () => {
    const selectedRows = tableRows.filter(row => row.selected)
    
    if (selectedRows.length === 0) {
      // 선택된 행이 없으면 알림 표시
      showAlert('초기화할 행을 선택해주세요', 'warning')
      return
    }
    
    // 선택된 행들만 초기화
    const newRows = tableRows.map(row => {
      if (row.selected) {
        // 선택된 행은 초기화 (체크박스 해제, 다른 값들은 빈 값으로)
        const resetRow = createEmptyRow(daysInMonth)
        resetRow.id = row.id // ID는 유지
        return resetRow
      }
      return row // 선택되지 않은 행은 그대로 유지
    })
    
    setTableRows(newRows)
  }

  // 테이블 헤더 생성
  const renderTableHeaders = () => {
    const fixedHeaders = ['', '이름', 'D', 'E', 'N', 'OFF', '근무일']
    const headers = []
    
    // 고정 헤더 7개
    fixedHeaders.forEach((header, index) => {
      let className = 'border border-gray-400 p-2 text-center bg-gray-100 font-extrabold '
      
      if (index === 0) {
        // 체크박스 헤더
        className += 'w-12'
      } else if (header === '이름' || header === '근무일') {
        // 넓은 칸
        className += 'w-32'
      } else {
        // 일반 칸
        className += 'w-16'
      }
      
      headers.push(
        <th key={`fixed-${index}`} className={className}>
          {index === 0 ? (
            <input
              type="checkbox"
              className="checkbox checkbox-sm"
              onChange={(e) => {
                // 전체 선택/해제
                const newRows = tableRows.map(row => ({
                  ...row,
                  selected: e.target.checked
                }))
                setTableRows(newRows)
              }}
              checked={tableRows.length > 0 && tableRows.every(row => row.selected)}
            />
          ) : header}
        </th>
      )
    })
    
    // 날짜 헤더 (현재 달의 일 수만큼)
    for (let i = 1; i <= daysInMonth; i++) {
      headers.push(
        <th key={`date-${i}`} className="border border-gray-400 p-2 text-center bg-blue-50 font-extrabold text-xs w-8 max-w-8">
          {i}
        </th>
      )
    }
    
    return headers
  }

  // 테이블 행 생성
  const renderTableRows = () => {
    return tableRows.map((row, rowIndex) => (
      <tr key={row.id}>
        {/* 체크박스 */}
        <td className="border border-gray-300 p-1 text-center w-12">
          <input 
            type="checkbox" 
            className="checkbox checkbox-sm"
            checked={row.selected}
            onChange={(e) => {
              const newRows = [...tableRows]
              newRows[rowIndex].selected = e.target.checked
              setTableRows(newRows)
            }}
          />
        </td>
        
        {/* 이름 */}
        <td className="border border-gray-300 p-1 w-32">
          <input 
            type="text" 
            className="name-input w-full p-1 text-sm border-none outline-none bg-transparent"
            placeholder="이름 입력"
            value={row.name}
            onChange={(e) => {
              const newRows = [...tableRows]
              newRows[rowIndex].name = e.target.value
              setTableRows(newRows)
            }}
          />
        </td>
        
        {/* D, E, N, OFF 칸 */}
        {['d', 'e', 'n', 'off'].map((field) => {
          const counts = calculateCounts(row)
          const displayValue = field === 'off' ? counts.off : counts[field]
          
          return (
            <td key={field} className="border border-gray-300 p-1 text-center w-16 bg-gray-50">
              <span className="text-sm font-medium">{displayValue}</span>
            </td>
          )
        })}
        
        {/* 근무일 */}
        <td className="border border-gray-300 p-1 text-center w-32 bg-gray-50">
          <span className="text-sm font-medium">{calculateWorkDays(row)}</span>
        </td>
        
        {/* 날짜별 칸들 */}
        {Array.from({length: daysInMonth}, (_, i) => i + 1).map((day) => (
          <td key={`date-${day}`} className="border border-gray-300 p-1 w-8 max-w-8">
            <select 
              className="w-full p-1 text-xs text-center border-none outline-none bg-transparent cursor-pointer appearance-none"
              value={row.dates[day]}
              onChange={(e) => {
                const newValue = e.target.value
                
                // 일일 제한 체크
                if (newValue && !canSelectWorkType(rowIndex, day, newValue)) {
                  const limit = workRules.dailyLimits[newValue]
                  showAlert(`${day}일의 ${newValue} 근무는 하루에 최대 ${limit}명까지만 선택할 수 있습니다.`, 'warning')
                  return
                }
                
                // 근무 충돌 체크
                const conflictCheck = checkWorkConflict(rowIndex, day, newValue)
                if (conflictCheck.hasConflict) {
                  showAlert(
                    `${day}일에 ${row.name}과(와) ${conflictCheck.conflictEmployee}은(는) 같은 유형의 근무를 할 수 없습니다.\n` +
                    `(${conflictCheck.conflictEmployee}이(가) 이미 같은 ${conflictCheck.conflictWork} 근무를 선택했습니다)`,
                    'warning'
                  )
                  return
                }
                
                const newRows = [...tableRows]
                newRows[rowIndex].dates[day] = newValue
                setTableRows(newRows)
              }}
            >
              <option value="" disabled hidden></option>
              <option value="D">D</option>
              <option value="E">E</option>
              <option value="N">N</option>
              <option value="/">/</option>
            </select>
          </td>
        ))}
      </tr>
    ))
  }

  return (
    <div className="drawer drawer-end min-h-screen">
      <input id="menu-drawer" type="checkbox" className="drawer-toggle" checked={isMenuOpen} onChange={() => setIsMenuOpen(!isMenuOpen)} />
      
      <div className="drawer-content w-full">
          <div>
              <h1 className="text-2xl font-bold mt-5 mb-2 ml-5">{currentMonth}월 근무 스케줄</h1>
          </div>
        <p className="text-sm text-gray-600 mb-5 ml-5"></p>
        
        <div className="flex justify-between items-center mb-2 px-5">
          <div className="flex gap-2">
            <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 px-4 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 hover:cursor-pointer" onClick={resetTable}>
              초기화
            </button>
            <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 px-4 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 hover:cursor-pointer" onClick={deleteRow}>
              행삭제
            </button>
            <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 px-4 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 hover:cursor-pointer" onClick={addRow}>
              행추가
            </button>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-ghost btn-sm btn-square" onClick={handleExcelExport}>
              <img 
                src={btnExcel} 
                alt="Excel" 
                className="w-5 h-5 object-contain"
                draggable="false"
              />
            </button>
            <label htmlFor="menu-drawer" className="btn btn-ghost btn-sm btn-square drawer-button">
              <img 
                src={btnSet} 
                alt="Settings" 
                className="w-5 h-5 object-contain hover"
                draggable="false"
              />
            </label>
          </div>
        </div>
        
        <div className="w-full overflow-x-auto px-5">
          <table className="table table-fixed w-full border-collapse">
            <thead>
              <tr>
                {renderTableHeaders()}
              </tr>
            </thead>
            <tbody>
              {renderTableRows()}
            </tbody>
          </table>
        </div>
      </div>

      <SettingsDrawer 
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onWorkRuleClick={() => setIsWorkRuleModalOpen(true)}
        onExcelImport={handleExcelImport}
        onHelpClick={() => setIsHelpModalOpen(true)}
      />

      <WorkRuleModal 
        isOpen={isWorkRuleModalOpen}
        onClose={() => setIsWorkRuleModalOpen(false)}
        workRules={workRules}
        setWorkRules={setWorkRules}
        onCloseSettings={() => setIsMenuOpen(false)}
        employeeNames={tableRows.map(row => row.name?.trim()).filter(name => name)} // 빈 이름 제외
      />

      <HelpModal 
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </div>
  )
}

export default App