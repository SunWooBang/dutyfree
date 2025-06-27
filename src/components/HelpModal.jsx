const HelpModal = ({ isOpen, onClose }) => {
  return (
    <>
      <input 
        type="checkbox" 
        id="help-modal" 
        className="modal-toggle" 
        checked={isOpen} 
        onChange={() => onClose()} 
      />
      <div className="modal">
        <div className="modal-box w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg">사용법 안내</h3>
            <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}>
              ✕
            </button>
          </div>

          <div className="space-y-6">
            {/* Excel 불러오기 안내 */}
            <div className="card bg-blue-50 border border-blue-200">
              <div className="card-body p-4">
                <h4 className="card-title text-blue-700 text-base">📁 Excel 파일 불러오기</h4>
                <div className="text-sm space-y-2">
                  <p><strong>지원 형식:</strong> .xlsx, .xls</p>
                  <p><strong>파일 구조:</strong></p>
                  <div className="bg-white p-3 rounded border text-xs font-mono">
                    <div className="grid grid-cols-8 gap-1 text-center">
                      <div className="bg-gray-200 p-1">이름</div>
                      <div className="bg-gray-200 p-1">D</div>
                      <div className="bg-gray-200 p-1">E</div>
                      <div className="bg-gray-200 p-1">N</div>
                      <div className="bg-gray-200 p-1">OFF</div>
                      <div className="bg-gray-200 p-1">근무일</div>
                      <div className="bg-gray-200 p-1">1일...</div>
                    </div>
                    <div className="grid grid-cols-8 gap-1 text-center mt-1">
                      <div className="p-1">홍길동</div>
                      <div className="p-1">-</div>
                      <div className="p-1">-</div>
                      <div className="p-1">-</div>
                      <div className="p-1">-</div>
                      <div className="p-1">-</div>
                      <div className="p-1">D</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600">
                    • 헤더 행 다음부터 데이터가 시작되어야 합니다<br/>
                    • 2번째 열(B열)에 이름을 입력하세요<br/>
                    • 7번째 열(G열)부터 각 날짜의 스케줄을 입력하세요<br/>
                    • 유효한 값: D(주간), E(저녁), N(야간), /(휴무)
                  </div>
                </div>
              </div>
            </div>

            {/* 기본 사용법 */}
            <div className="card bg-green-50 border border-green-200">
              <div className="card-body p-4">
                <h4 className="card-title text-green-700 text-base">🎯 기본 사용법</h4>
                <div className="text-sm space-y-2">
                  <div><strong>1. 행 관리:</strong></div>
                  <ul className="list-disc list-inside ml-4 text-xs space-y-1">
                    <li>행추가: 새로운 직원 추가</li>
                    <li>행삭제: 선택된 행 삭제</li>
                    <li>초기화: 선택된 행의 데이터만 지우기</li>
                  </ul>
                  
                  <div><strong>2. 스케줄 입력:</strong></div>
                  <ul className="list-disc list-inside ml-4 text-xs space-y-1">
                    <li>각 날짜 칸을 클릭하여 D, E, N, / 선택</li>
                    <li>D, E, N, OFF 열은 자동으로 계산됩니다</li>
                    <li>근무일 열도 설정에 따라 자동 계산됩니다</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 근무 코드 안내 */}
            <div className="card bg-yellow-50 border border-yellow-200">
              <div className="card-body p-4">
                <h4 className="card-title text-yellow-700 text-base">📝 근무 코드</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="badge badge-primary">D</span>
                      <span>주간 근무 (Day)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="badge badge-warning">E</span>
                      <span>저녁 근무 (Evening)</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="badge badge-secondary">N</span>
                      <span>야간 근무 (Night)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="badge badge-ghost">/</span>
                      <span>휴무일 (OFF)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 설정 안내 */}
            <div className="card bg-purple-50 border border-purple-200">
              <div className="card-body p-4">
                <h4 className="card-title text-purple-700 text-base">⚙️ 설정 기능</h4>
                <div className="text-sm space-y-2">
                  <div><strong>근무일 규칙:</strong></div>
                  <ul className="list-disc list-inside ml-4 text-xs space-y-1">
                    <li>일일 제한: 하루에 각 근무타입별 최대 인원 제한</li>
                    <li>계산 방식: 근무일 계산 방법 선택</li>
                  </ul>
                  
                  <div><strong>데이터 관리:</strong></div>
                  <ul className="list-disc list-inside ml-4 text-xs space-y-1">
                    <li>Excel 내보내기: 현재 데이터를 Excel 파일로 저장</li>
                    <li>Excel 불러오기: 기존 Excel 파일에서 데이터 가져오기</li>
                    <li>전체 초기화: 모든 설정과 데이터 삭제</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-action">
            <button className="btn btn-primary" onClick={onClose}>
              확인
            </button>
          </div>
        </div>
        <label className="modal-backdrop" htmlFor="help-modal" onClick={onClose}></label>
      </div>
    </>
  )
}

export default HelpModal
