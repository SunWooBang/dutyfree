import { showAlert } from '../utils/alertUtils'

const WorkRuleModal = ({ 
  isOpen, 
  onClose, 
  workRules, 
  setWorkRules,
  onCloseSettings 
}) => {
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

            <div className="divider"></div>
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
