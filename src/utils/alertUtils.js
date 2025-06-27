// 성공 알림 표시 함수
export const showSuccessToast = (message) => {
  showAlert(message, 'success')
}

// 로딩 토스트 표시 함수
export const showLoadingToast = (message) => {
  const toast = document.createElement('div')
  toast.className = 'fixed top-4 w-full flex justify-center'
  toast.style.zIndex = '99999'
  toast.style.pointerEvents = 'none'
  toast.innerHTML = `
    <div class="alert alert-info shadow-lg w-auto">
      <div class="flex items-center">
        <span class="loading loading-spinner loading-sm"></span>
        <span>${message}</span>
      </div>
    </div>
  `
  document.body.appendChild(toast)

  // 애니메이션 효과
  toast.style.opacity = '0'
  toast.style.transform = 'translateY(-20px)'
  toast.style.transition = 'all 0.3s ease-out'

  setTimeout(() => {
    toast.style.opacity = '1'
    toast.style.transform = 'translateY(0)'
  }, 10)

  return toast
}

// 로딩 토스트 숨기기 함수
export const hideLoadingToast = (toast) => {
  if (toast && document.body.contains(toast)) {
    toast.style.opacity = '0'
    toast.style.transform = 'translateY(-20px)'
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast)
      }
    }, 300)
  }
}

// 범용 알림 표시 함수
export const showAlert = (message, type = 'success') => {
  const toast = document.createElement('div')
  toast.className = 'fixed top-4 w-full flex justify-center'
  toast.style.zIndex = '99999'
  toast.style.pointerEvents = 'none'
  
  let alertClass = 'alert alert-success'
  let iconSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  `

  if (type === 'warning') {
    alertClass = 'alert alert-warning'
    iconSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    `
  } else if (type === 'error') {
    alertClass = 'alert alert-error'
    iconSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    `
  }
  
  toast.innerHTML = `
    <div class="${alertClass} shadow-lg w-auto max-w-lg">
      <div class="flex items-center">
        ${iconSvg}
        <span class="whitespace-pre-line">${message}</span>
      </div>
    </div>
  `
  
  document.body.appendChild(toast)

  // 애니메이션 효과
  toast.style.opacity = '0'
  toast.style.transform = 'translateY(-20px)'
  toast.style.transition = 'all 0.3s ease-out'

  setTimeout(() => {
    toast.style.opacity = '1'
    toast.style.transform = 'translateY(0)'
  }, 10)

  // 타입에 따라 표시 시간 조정 (에러는 더 오래 표시)
  const displayTime = type === 'error' ? 5000 : 3000

  setTimeout(() => {
    toast.style.opacity = '0'
    toast.style.transform = 'translateY(-20px)'
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast)
      }
    }, 300)
  }, displayTime)
}
