// ONLY SERVER SIDE

import { env } from "$env/dynamic/private"
import { logger } from "@vtfk/logger"

export const hasFileAccessForStudent = (teacherStudent, loggerPrefix) => {
  // Husk leder rollen også...
  logger('info', [loggerPrefix, 'Checking if teacher has contactTeacher access'])
  if (teacherStudent.skoler.some(school => school.kontaktlarer)) {
    logger('info', [loggerPrefix, 'Teacher has contactTeacher access'])
    return true
  }
  if (env.FAGLARER_ACCESS_ENABLED === 'true') {
    logger('info', [loggerPrefix, 'env.FAGLARER_ACCESS_ENABLED is true - all teachers have access'])
    return true
  }
  if (env.IOP_FAGLARER_ACCESS_ENABLED === 'true') {
    logger('info', [loggerPrefix, 'env.IOP_FAGLARER_ACCESS_ENABLED is true - checking if teacher has IOP access'])
    if (teacherStudent.skoler.some(school => school.iop)) {
      logger('info', [loggerPrefix, 'Teacher has IOP access'])
      return true
    }
  }
  return false
}