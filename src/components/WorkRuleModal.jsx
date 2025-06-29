import { showAlert } from '../utils/alertUtils'

const WorkRuleModal = ({ 
  isOpen, 
  onClose, 
  workRules, 
  setWorkRules,
  onCloseSettings,
  employeeNames = [] // 근무자 이름 목록 추가
}) => {
  // 이미 충돌 규칙에 설정된 근무자들 가져오기
  const getUsedEmployees = () => {
    if (!workRules.conflictRules) return []
    const used = new Set()
    workRules.conflictRules.forEach(rule => {
      if (rule.employee1) used.add(rule.employee1)
      if (rule.employee2) used.add(rule.employee2)
    })
    return Array.from(used)
  }

  // 새 규칙에 사용 가능한 근무자들
  const getAvailableEmployeesForNewRule = () => {
    const usedEmployees = getUsedEmployees()
    return employeeNames.filter(name => !usedEmployees.includes(name))
  }

  // 특정 규칙의 특정 위치에서 선택 가능한 근무자들
  const getAvailableEmployeesForSelect = (currentRuleIndex, isEmployee1) => {
    const currentRule = workRules.conflictRules[currentRuleIndex]
    const otherEmployee = isEmployee1 ? currentRule.employee2 : currentRule.employee1
    
    // 다른 규칙들에서 사용된 근무자들
    const usedInOtherRules = new Set()
    workRules.conflictRules.forEach((rule, index) => {
      if (index !== currentRuleIndex) {
        if (rule.employee1) usedInOtherRules.add(rule.employee1)
        if (rule.employee2) usedInOtherRules.add(rule.employee2)
      }
    })
    
    return employeeNames.filter(name => {
      // 같은 규칙 내에서 상대방과 다른 사람이어야 함
      if (name === otherEmployee) return false
      // 다른 규칙에서 이미 사용되지 않은 사람이어야 함
      if (usedInOtherRules.has(name)) return false
      return true
    })
  }

  const handleApply = () => {
    onClose()
    onCloseSettings() // 설정 메뉴도 함께 닫기
    // 설정 저장 알림 (모달 overlay 위에 표시)
    showAlert('근무일 규칙이 적용되었습니다!', 'success')
  }

  return (
    <>
      <input 
        type="checkbox" 
        id="work-rule-modal" 
        className="modal-toggle" 
        checked={isOpen} 
        onChange={() => onClose()} 
      />
      <div className="modal">
        <div className="modal-box w-11/12 max-w-3xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg">근무일 규칙 설정</h3>
            <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}>
              ✕
            </button>
          </div>

          {/* 현재 설정 요약 */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h4 className="font-medium text-sm text-gray-700 mb-2">현재 적용된 설정</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <div>일일 제한: {workRules.enableDailyLimit ? '활성화' : '비활성화'}</div>
              {workRules.enableDailyLimit && (
                <div className="flex gap-4">
                  <span>D: {workRules.dailyLimits.D}개</span>
                  <span>E: {workRules.dailyLimits.E}개</span>
                  <span>N: {workRules.dailyLimits.N}개</span>
                  <span>OFF: {workRules.dailyLimits['/']}개</span>
                </div>
              )}
              <div>계산 방식: {workRules.calculationMethod === 'sum' ? 'D+E+N 합계' : '전체일수-OFF'}</div>
              <div>근무 충돌 방지: {workRules.conflictRules?.length > 0 ? `${workRules.conflictRules.length}개 규칙 적용` : '설정 없음'}</div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-lg">일일 근무일 제한 설정</span>
                <span className="label-text-alt text-gray-500">하루에 선택할 수 있는 각 근무의 최대 개수</span>
              </label>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium text-blue-600">DAY (D)</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      className={`input input-bordered input-sm w-20 ${!workRules.enableDailyLimit ? 'input-disabled' : ''}`}
                      min="0" 
                      max="10" 
                      value={workRules.dailyLimits.D}
                      disabled={!workRules.enableDailyLimit}
                      onChange={(e) => setWorkRules(prev => ({
                        ...prev,
                        dailyLimits: { ...prev.dailyLimits, D: parseInt(e.target.value) || 0 }
                      }))}
                    />
                    <span className="text-sm text-gray-500">개</span>
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium text-orange-600">EVENING (E)</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      className={`input input-bordered input-sm w-20 ${!workRules.enableDailyLimit ? 'input-disabled' : ''}`}
                      min="0" 
                      max="10" 
                      value={workRules.dailyLimits.E}
                      disabled={!workRules.enableDailyLimit}
                      onChange={(e) => setWorkRules(prev => ({
                        ...prev,
                        dailyLimits: { ...prev.dailyLimits, E: parseInt(e.target.value) || 0 }
                      }))}
                    />
                    <span className="text-sm text-gray-500">개</span>
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium text-purple-600">NIGHT (N)</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      className={`input input-bordered input-sm w-20 ${!workRules.enableDailyLimit ? 'input-disabled' : ''}`}
                      min="0" 
                      max="10" 
                      value={workRules.dailyLimits.N}
                      disabled={!workRules.enableDailyLimit}
                      onChange={(e) => setWorkRules(prev => ({
                        ...prev,
                        dailyLimits: { ...prev.dailyLimits, N: parseInt(e.target.value) || 0 }
                      }))}
                    />
                    <span className="text-sm text-gray-500">개</span>
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium text-gray-600">OFF (/)</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      className={`input input-bordered input-sm w-20 ${!workRules.enableDailyLimit ? 'input-disabled' : ''}`}
                      min="0" 
                      max="10" 
                      value={workRules.dailyLimits['/']}
                      disabled={!workRules.enableDailyLimit}
                      onChange={(e) => setWorkRules(prev => ({
                        ...prev,
                        dailyLimits: { ...prev.dailyLimits, '/': parseInt(e.target.value) || 0 }
                      }))}
                    />
                    <span className="text-sm text-gray-500">개</span>
                  </div>
                </div>
              </div>

              <div className="form-control mt-4">
                <label className="cursor-pointer label justify-start">
                  <input 
                    type="checkbox" 
                    className="checkbox checkbox-primary" 
                    checked={workRules.enableDailyLimit}
                    onChange={(e) => setWorkRules(prev => ({
                      ...prev,
                      enableDailyLimit: e.target.checked
                    }))}
                  />
                  <span className="label-text ml-2">일일 제한 적용 (체크 해제 시 무제한)</span>
                </label>
              </div>
            </div>

            <div className="divider"></div>

            {/* 근무 충돌 방지 설정 */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-lg">근무 충돌 방지 설정</span>
                <span className="label-text-alt text-gray-500">특정 근무자들이 같은 날 근무하지 않도록 설정</span>
              </label>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-2 mb-2">
                  <div className="text-yellow-600 text-sm">⚠️</div>
                  <div className="text-sm text-yellow-700">
                    <div className="font-medium mb-1">충돌 방지 기능 사용법:</div>
                    <div className="text-xs space-y-1">
                      <div>• 같은 유형의 근무(D,E,N)를 하지 않도록 하는 근무자 쌍을 설정할 수 있습니다</div>
                      <div>• 예: "시우"와 "시율"이 사이가 나빠서 같은 유형 근무를 할 수 없는 경우</div>
                      <div>• 설정된 쌍 중 한 명이 특정 날짜에 D 근무를 선택하면, 다른 한 명은 그 날 D 근무만 선택할 수 없습니다</div>
                      <div>• OFF(/) 근무는 충돌에 해당하지 않습니다</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 충돌 규칙 목록 */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">충돌 방지 규칙 목록</span>
                  <button 
                    className="btn btn-sm btn-primary"
                    onClick={() => {
                      const availableEmployees = getAvailableEmployeesForNewRule()
                      if (availableEmployees.length < 2) {
                        const usedCount = getUsedEmployees().length
                        if (usedCount === 0) {
                          showAlert('충돌 규칙을 추가하려면 최소 2명의 근무자가 필요합니다.', 'warning')
                        } else {
                          showAlert(`이미 설정된 근무자들을 제외하고 사용 가능한 근무자가 ${availableEmployees.length}명입니다.\n새 규칙을 추가하려면 최소 2명이 필요합니다.`, 'warning')
                        }
                        return
                      }
                      const newRule = {
                        id: Date.now(),
                        employee1: '',
                        employee2: ''
                      }
                      setWorkRules(prev => ({
                        ...prev,
                        conflictRules: [...(prev.conflictRules || []), newRule]
                      }))
                    }}
                  >
                    규칙 추가
                  </button>
                </div>

                {(!workRules.conflictRules || workRules.conflictRules.length === 0) ? (
                  <div className="text-center text-gray-500 text-sm py-8 border-2 border-dashed border-gray-200 rounded-lg">
                    아직 설정된 충돌 방지 규칙이 없습니다.<br />
                    "규칙 추가" 버튼을 클릭하여 새 규칙을 만들어보세요.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {workRules.conflictRules.map((rule, index) => (
                      <div key={rule.id} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
                        <span className="text-sm text-gray-600 min-w-0 flex-shrink-0">#{index + 1}</span>
                        
                        <select 
                          className="select select-bordered select-sm flex-1 min-w-0"
                          value={rule.employee1}
                          onChange={(e) => {
                            const newRules = [...workRules.conflictRules]
                            newRules[index].employee1 = e.target.value
                            setWorkRules(prev => ({
                              ...prev,
                              conflictRules: newRules
                            }))
                          }}
                        >
                          <option value="">근무자 선택</option>
                          {getAvailableEmployeesForSelect(index, true).map(name => (
                            <option key={name} value={name}>
                              {name}
                            </option>
                          ))}
                        </select>
                        
                        <span className="text-sm text-gray-500 flex-shrink-0">와</span>
                        
                        <select 
                          className="select select-bordered select-sm flex-1 min-w-0"
                          value={rule.employee2}
                          onChange={(e) => {
                            const newRules = [...workRules.conflictRules]
                            newRules[index].employee2 = e.target.value
                            setWorkRules(prev => ({
                              ...prev,
                              conflictRules: newRules
                            }))
                          }}
                        >
                          <option value="">근무자 선택</option>
                          {getAvailableEmployeesForSelect(index, false).map(name => (
                            <option key={name} value={name}>
                              {name}
                            </option>
                          ))}
                        </select>
                        
                        <span className="text-sm text-gray-500 flex-shrink-0">같은 유형 근무 금지</span>
                        
                        <button 
                          className="btn btn-sm btn-ghost btn-circle text-red-500 hover:bg-red-50"
                          onClick={() => {
                            const newRules = workRules.conflictRules.filter((_, i) => i !== index)
                            setWorkRules(prev => ({
                              ...prev,
                              conflictRules: newRules
                            }))
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="divider"></div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">전체 근무일 계산 방식</span>
              </label>
              <div className="space-y-2">
                <label className="cursor-pointer label justify-start">
                  <input 
                    type="radio" 
                    name="workDayRule" 
                    className="radio radio-primary" 
                    checked={workRules.calculationMethod === 'sum'}
                    onChange={() => setWorkRules(prev => ({
                      ...prev,
                      calculationMethod: 'sum'
                    }))}
                  />
                  <span className="label-text ml-2">D + E + N 근무로 계산</span>
                </label>
                <label className="cursor-pointer label justify-start">
                  <input 
                    type="radio" 
                    name="workDayRule" 
                    className="radio radio-primary ml-15"
                    checked={workRules.calculationMethod === 'exclude_off'}
                    onChange={() => setWorkRules(prev => ({
                      ...prev,
                      calculationMethod: 'exclude_off'
                    }))}
                  />
                  <span className="label-text ml-2">전체 일수에서 OFF(/) 일수를 제외하고 계산</span>
                </label>
              </div>
            </div>
          </div>

          <div className="modal-action">
            <button className="btn btn-ghost" onClick={onClose}>
              취소
            </button>
            <button className="btn btn-primary" onClick={handleApply}>
              적용
            </button>
          </div>
        </div>
        <label className="modal-backdrop" htmlFor="work-rule-modal" onClick={onClose}></label>
      </div>
    </>
  )
}

export default WorkRuleModal
