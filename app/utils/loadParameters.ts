import axios from 'axios'
import Logger from '@ioc:Adonis/Core/Logger'
const logger = Logger.child({ module: 'loadParameters' })

export type OutgoingTaskParameter = {
  taskId: string
  parameterName: string
  parameterValue: string
}

export function loadOutgoingTaskParameter({
  taskId,
  parameterName,
  parameterValue,
}: OutgoingTaskParameter): void {
  try {
    const payload = {
      idTarea: taskId,
      NombreParametro: parameterName,
      Valor: parameterValue,
    }
    axios.post(`${process.env.DBINTERFACE_URL}/outgoing_task_params/update_or_create/`, payload)
  } catch (error) {
    logger.error({ error }, 'Error trying to load outgoing task parameter')
  }
}
