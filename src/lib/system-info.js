import { env } from "$env/dynamic/private"
import { version } from "../../package.json"

export const getSystemInfo = () => {
  return {
    version,
    IOP_FAGLARER_ACCESS_ENABLED: env.IOP_FAGLARER_ACCESS_ENABLED === 'true',
    FAGLARER_ACCESS_ENABLED: env.FAGLARER_ACCESS_ENABLED === 'true'
  }
}