export const sizeMatchstickStorage = ()=>{
  const mobileOS = ['ios', 'android']
  const userAgent = navigator.userAgent.toLowerCase()

  if(mobileOS.some( os => userAgent.includes(os))){
    const matchstickStorage = document.querySelector('.matchstickStorage') as HTMLElement
    matchstickStorage.style.flex = '5' 
    window.alert(matchstickStorage)
  }
}

export const sizeMatchstick = ()=>{
  
}
