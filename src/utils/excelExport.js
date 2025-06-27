// 엑셀 내보내기 유틸리티

export const exportToExcel = (tableRows, currentMonth, daysInMonth, workRules) => {
  // 워크북과 워크시트 생성
  const wb = XLSX.utils.book_new();
  
  // 헤더 생성
  const headers = ['이름', 'D', 'E', 'N', 'OFF', '근무일'];
  
  // 날짜 헤더 추가 (1일부터 해당 월의 마지막 일까지)
  for (let i = 1; i <= daysInMonth; i++) {
    headers.push(`${i}일`);
  }
  
  // 데이터 배열 생성
  const data = [];
  
  // 헤더 추가
  data.push(headers);
  
  // 각 행의 데이터 생성
  tableRows.forEach(row => {
    const rowData = [];
    
    // 이름
    rowData.push(row.name || '');
    
    // D, E, N, OFF 개수 계산
    const counts = calculateCounts(row);
    rowData.push(counts.d);
    rowData.push(counts.e);
    rowData.push(counts.n);
    rowData.push(counts.off);
    
    // 근무일 계산
    const workDays = calculateWorkDays(row, daysInMonth, workRules);
    rowData.push(workDays);
    
    // 날짜별 데이터 추가
    for (let i = 1; i <= daysInMonth; i++) {
      rowData.push(row.dates[i] || '');
    }
    
    data.push(rowData);
  });
  
  // 워크시트 생성
  const ws = XLSX.utils.aoa_to_sheet(data);
  
  // 열 너비 설정
  const colWidths = [
    { wch: 15 }, // 이름
    { wch: 5 },  // D
    { wch: 5 },  // E
    { wch: 5 },  // N
    { wch: 6 },  // OFF
    { wch: 8 },  // 근무일
  ];
  
  // 날짜 열들의 너비 설정
  for (let i = 1; i <= daysInMonth; i++) {
    colWidths.push({ wch: 5 });
  }
  
  ws['!cols'] = colWidths;
  
  // 헤더 스타일링 (첫 번째 행)
  const headerRange = XLSX.utils.decode_range(ws['!ref']);
  for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
    if (!ws[cellAddress]) continue;
    
    ws[cellAddress].s = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "4F46E5" } },
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } }
      }
    };
  }
  
  // 데이터 셀들에 테두리 추가
  for (let row = 1; row <= headerRange.e.r; row++) {
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
      if (!ws[cellAddress]) {
        ws[cellAddress] = { v: "", t: "s" };
      }
      
      ws[cellAddress].s = {
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } }
        },
        alignment: { horizontal: "center", vertical: "center" }
      };
    }
  }
  
  // 워크시트를 워크북에 추가
  XLSX.utils.book_append_sheet(wb, ws, `${currentMonth}월 근무스케줄`);
  
  // 파일명 생성 (현재 날짜 포함)
  const now = new Date();
  const year = now.getFullYear();
  const fileName = `${year}년_${currentMonth}월_근무스케줄_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}.xlsx`;
  
  // 엑셀 파일 다운로드
  XLSX.writeFile(wb, fileName);
  
  return fileName;
};

// D, E, N, OFF 개수 계산 함수
const calculateCounts = (row) => {
  const counts = { d: 0, e: 0, n: 0, off: 0 };
  
  Object.values(row.dates).forEach(value => {
    switch(value) {
      case 'D':
        counts.d++;
        break;
      case 'E':
        counts.e++;
        break;
      case 'N':
        counts.n++;
        break;
      case '/':
        counts.off++;
        break;
    }
  });
  
  return counts;
};

// 근무일 계산 함수 (설정에 따라)
const calculateWorkDays = (row, daysInMonth, workRules) => {
  const counts = calculateCounts(row);
  
  if (workRules && workRules.calculationMethod === 'sum') {
    // D + E + N 합계로 계산
    return counts.d + counts.e + counts.n;
  } else if (workRules && workRules.calculationMethod === 'exclude_off') {
    // 전체 일수에서 OFF 일수를 제외
    return daysInMonth - counts.off;
  } else {
    // 기본값: D + E + N으로 계산
    return counts.d + counts.e + counts.n;
  }
};

// SheetJS 라이브러리 로드 함수
export const loadSheetJS = () => {
  return new Promise((resolve, reject) => {
    if (window.XLSX) {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    script.onload = () => {
      if (window.XLSX) {
        resolve();
      } else {
        reject(new Error('XLSX 라이브러리 로드 실패'));
      }
    };
    script.onerror = () => reject(new Error('XLSX 라이브러리 로드 실패'));
    document.head.appendChild(script);
  });
};
