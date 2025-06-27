const SettingsDrawer = ({ 
  isOpen, 
  onClose, 
  onWorkRuleClick, 
  onExcelImport, 
  onHelpClick 
}) => {
  const handleFullReset = () => {
    if (confirm('모든 설정과 데이터가 초기화됩니다. 계속하시겠습니까?')) {
      localStorage.removeItem('workRules')
      localStorage.removeItem('tableRows')
      window.location.reload()
    }
  }

  return (
    <div className="drawer-side z-50">
      <label htmlFor="menu-drawer" className="drawer-overlay"></label>
      <div className="w-80 min-h-full bg-base-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">설정</h2>
          <label htmlFor="menu-drawer" className="btn btn-sm btn-circle btn-ghost">
            ✕
          </label>
        </div>
        
        <div className="menu w-full">
          <li><a onClick={onWorkRuleClick}>근무일 규칙</a></li>
          <li><a onClick={onExcelImport}>Excel 불러오기</a></li>
          <li><a onClick={handleFullReset}>전체 초기화</a></li>
          <li><a onClick={onHelpClick}>사용법 안내</a></li>
          <li className="menu-title"><a>정보</a></li>
        </div>
      </div>
    </div>
  )
}

export default SettingsDrawer
