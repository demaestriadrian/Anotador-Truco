export const sizeMatchstickStorage = ()=>{
  const mobileOS = ['ios', 'android']
  const userAgent = navigator.userAgent.toLowerCase()

  window.ooss = mobileOS
  window.userAgent = userAgent
  if(mobileOS.some( os => userAgent.includes(os))){
    const matchstickStorage = document.querySelector('.matchstickStorage')
    matchstickStorage.style.flex = '5'
    window.alert(matchstickStorage)
  }
}

export const sizeMatchstick = ()=>{
  
}
