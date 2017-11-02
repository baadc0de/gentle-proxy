declare module 'await-mutex' {
  type Unlocker = () => void

  export default class Mutex {
    lock(): Promise<Unlocker>
    isLocked(): boolean
  }
}