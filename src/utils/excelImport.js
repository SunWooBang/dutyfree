// Excel 불러오기 유틸리티

/**
 * SheetJS 라이브러리 로드
 */
export const loadSheetJS = () => {
  return new Promise((resolve, reject) => {
    if (window.XLSX) {
      resolve(window.XLSX);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    script.onload = () => resolve(window.XLSX);
    script.onerror = () => reject(new Error('SheetJS 라이브러리를 로드할 수 없습니다.'));
    document.head.appendChild(script);
  });
};

/**
 * 파일 선택 대화상자 열기
 */
export const openFileDialog = () => {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls';
    input.style.display = 'none';
    input.multiple = false;
    
    let isResolved = false;
    
    input.onchange = (event) => {
      if (isResolved) return;
      isResolved = true;
      
      const file = event.target.files[0];
      if (file) {
        resolve(file);
      } else {
        reject(new Error('파일이 선택되지 않았습니다.'));
      }
      
      // 파일 입력 엘리먼트 제거
      setTimeout(() => {
        if (document.body.contains(input)) {
          document.body.removeChild(input);
        }
      }, 100);
    };
    
    // 대화상자가 취소된 경우 처리 (focus 이벤트 사용)
    const handleCancel = () => {
      setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          reject(new Error('파일 선택이 취소되었습니다.'));
          if (document.body.contains(input)) {
            document.body.removeChild(input);
          }
        }
      }, 1000);
    };
    
    window.addEventListener('focus', handleCancel, { once: true });
    
    document.body.appendChild(input);
    input.click();
  });
};

/**
 * Excel 파일 읽기
 */
export const readExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    // 파일 크기 체크 (10MB 제한)
    if (file.size > 10 * 1024 * 1024) {
      reject(new Error('파일 크기가 너무 큽니다. 10MB 이하의 파일을 선택해주세요.'));
      return;
    }
    
    // 파일 확장자 체크
    const allowedExtensions = ['.xlsx', '.xls'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (!allowedExtensions.includes(fileExtension)) {
      reject(new Error(`지원하지 않는 파일 형식입니다.\n허용된 형식: ${allowedExtensions.join(', ')}`));
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        await loadSheetJS();
        
        const data = new Uint8Array(e.target.result);
        const workbook = window.XLSX.read(data, { type: 'array' });
        
        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          throw new Error('Excel 파일에 유효한 시트가 없습니다.');
        }
        
        // 첫 번째 시트 읽기
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        if (!worksheet) {
          throw new Error(`시트 "${sheetName}"을 읽을 수 없습니다.`);
        }
        
        // JSON으로 변환 (header를 1로 설정하여 첫 번째 행을 헤더로 사용)
        const jsonData = window.XLSX.utils.sheet_to_json(worksheet, { 
          header: 1,
          defval: null // 빈 셀을 null로 처리
        });
        
        if (jsonData.length === 0) {
          throw new Error('Excel 시트에 데이터가 없습니다.');
        }
        
        resolve({ sheetName, data: jsonData });
      } catch (error) {
        reject(new Error(`Excel 파일을 읽는 중 오류가 발생했습니다:\n${error.message}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('파일을 읽을 수 없습니다. 파일이 손상되었거나 접근할 수 없습니다.'));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Excel 데이터를 앱 데이터 형식으로 변환
 */
export const convertExcelDataToAppFormat = (excelData, currentMonth, daysInMonth) => {
  try {
    if (!excelData || !excelData.data || excelData.data.length < 2) {
      throw new Error('Excel 파일에 유효한 데이터가 없습니다.\n헤더 행과 최소 1개의 데이터 행이 필요합니다.');
    }
    
    const rows = excelData.data;
    const headerRow = rows[0];
    
    // 헤더 검증 - 체크박스 칸 제외하고 최소한 이름과 날짜 칸들이 있는지 확인
    // 체크박스 칸은 엑셀 내보내기 시 제외되므로, 기대 열 수에서 체크박스 칸 제외
    const expectedColumns = 6 + daysInMonth; // [이름, D, E, N, OFF, 근무일, 1일, 2일, ..., daysInMonth일]
    if (!headerRow || headerRow.length < expectedColumns) {
      throw new Error(
        `Excel 파일 형식이 올바르지 않습니다.\n` +
        `현재 ${currentMonth}월(${daysInMonth}일)에 필요한 최소 열 수: ${expectedColumns}개\n` +
        `현재 파일의 열 수: ${headerRow ? headerRow.length : 0}개\n\n` +
        `올바른 형식: [이름, D, E, N, OFF, 근무일, 1일, 2일, ..., ${daysInMonth}일]\n` +
        `(체크박스 칸은 엑셀에서 제외됨)`
      );
    }
    
    // 데이터 행들 처리
    const convertedRows = [];
    let validRowCount = 0;
    let invalidValueCount = 0;
    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      
      // 빈 행 건너뛰기
      if (!row || row.length === 0 || !row.some(cell => cell !== undefined && cell !== null && cell !== '')) {
        continue;
      }
      
      const newRow = {
        id: Date.now() + i, // 고유 ID 생성
        selected: false, // 체크박스는 항상 false로 시작 (엑셀에 없음)
        name: row[0] ? String(row[0]).trim() : '', // 첫 번째 열이 이름 (체크박스 칸 제외됨)
        workDays: 0, // 계산될 예정
        dates: {}
      };
      
      let hasValidData = false;
      
      // 날짜별 데이터 추출 (7번째 열부터 날짜 데이터)
      for (let day = 1; day <= daysInMonth; day++) {
        const colIndex = 5 + day; // 6 + (day-1) = 5 + day (인덱스 6부터 1일 시작)
        let cellValue = '';
        
        if (colIndex < row.length && row[colIndex] !== undefined && row[colIndex] !== null) {
          cellValue = String(row[colIndex]).trim().toUpperCase();
          
          // 유효한 값인지 확인
          if (['D', 'E', 'N', '/'].includes(cellValue)) {
            newRow.dates[day] = cellValue;
            hasValidData = true;
          } else if (cellValue !== '') {
            // 유효하지 않은 값이 있으면 경고하지만 무시
            console.warn(`${newRow.name || '이름없음'}의 ${day}일 값 "${cellValue}"은(는) 유효하지 않습니다.`);
            invalidValueCount++;
          }
        }
        
        // 빈 값 처리
        if (!newRow.dates[day]) {
          newRow.dates[day] = '';
        }
      }
      
      // 이름이나 유효한 스케줄 데이터가 있는 행만 추가
      if (newRow.name || hasValidData) {
        convertedRows.push(newRow);
        validRowCount++;
      }
    }
    
    if (convertedRows.length === 0) {
      throw new Error(
        'Excel 파일에서 유효한 데이터 행을 찾을 수 없습니다.\n\n' +
        '확인사항:\n' +
        '1. 첫 번째 열에 이름이 입력되어 있는지\n' +
        '2. 7번째 열부터 스케줄 데이터(D, E, N, /)가 입력되어 있는지\n' +
        '3. 헤더 행 다음에 실제 데이터 행이 있는지\n' +
        '4. 체크박스 칸이 없는 엑셀 형식인지 확인'
      );
    }
    
    // 변환 요약 정보 로그
    console.log(`Excel 변환 완료: ${validRowCount}명의 데이터 처리, ${invalidValueCount}개의 무효한 값 무시됨`);
    
    return convertedRows;
    
  } catch (error) {
    throw new Error(`Excel 데이터 변환 중 오류가 발생했습니다:\n${error.message}`);
  }
};

/**
 * Excel 파일 불러오기 메인 함수
 */
export const importFromExcel = async (currentMonth, daysInMonth) => {
  try {
    // 1. 파일 선택 대화상자 열기
    const file = await openFileDialog();
    
    // 2. Excel 파일 읽기
    const excelData = await readExcelFile(file);
    
    // 3. 앱 데이터 형식으로 변환
    const convertedData = convertExcelDataToAppFormat(excelData, currentMonth, daysInMonth);
    
    return {
      success: true,
      data: convertedData,
      fileName: file.name,
      rowCount: convertedData.length
    };
    
  } catch (error) {
    console.error('Excel 불러오기 오류:', error);
    return {
      success: false,
      error: error.message
    };
  }
};