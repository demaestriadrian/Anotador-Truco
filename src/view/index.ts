import initSizes from './sizes'
await import ('./less/index.less')
// import less from 'less'

export const initView = async (): Promise<void> => {
  initSizes()
}
