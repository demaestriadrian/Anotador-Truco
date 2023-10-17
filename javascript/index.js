import './height.js'  
import Fosforo from './fosforo.class.js'
import { fosforosArray } from './fosforos.js'


import { almacenArray } from './almacenFosforos.js'

less.modifyVars({'@almacenBackground': 'transparent'})


const a1 = document.querySelector('#a1')
const a2 = document.querySelector('.almacenFosforos')

a1.appendChild(fosforosArray[0].fosforoElement)
a2.appendChild(fosforosArray[2].fosforoElement)


windows.almacenArray = almacenArray
window.fosforos = fosforosArray
window.Fosforo = Fosforo

