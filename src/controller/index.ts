import { initView } from '../view/index.ts'

export const initController = async (): Promise<void> => {
  await initView()
}
