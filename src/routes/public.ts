import { router, Parameters, responses, time } from '../worker'
import { publicModels } from '../public-models'

const isPublished = (value: Record<string, any>, config: { publishedField?: string; publishedValue?: string; publishedAtField?: string }) => {
    if (config.publishedField) {
        return value?.[config.publishedField] === config.publishedValue
    }

    if (config.publishedAtField) {
        const publishedAt = value?.[config.publishedAtField]
        if (!publishedAt) return false
        if (typeof publishedAt === 'number') {
            const timestamp = publishedAt > 1_000_000_000_000 ? Math.floor(publishedAt / 1000) : publishedAt
            return timestamp <= time()
        }
        if (typeof publishedAt === 'string') {
            const parsed = Date.parse(publishedAt)
            if (Number.isNaN(parsed)) return false
            return parsed <= Date.now()
        }
        return Boolean(publishedAt)
    }

    return false
}

export function addPublicRoutes() {
    router.get('/content/:model/*', async (parameters: Parameters) => {
        const model = parameters.parameters?.model
        if (!model) return responses.notFound

        const config = publicModels[model]
        if (!config) return responses.notFound

        const name = decodeURI(parameters.parameters['*'] ?? '')
        if (!name) return responses.notFound

        const result = await parameters.environment.DB.prepare(
            'select rowid, value, modified_at from documents where model = ? and name = ?'
        )
            .bind(model, name)
            .first<{ rowid: number; value: string; modified_at: number }>()

        if (!result) return responses.notFound

        const value = {
            ...JSON.parse(result.value),
            _modified_at: result.modified_at,
            _model: model,
            _name: name,
            _id: result.rowid,
        }

        if (!isPublished(value, config)) return responses.notFound

        return responses.json(value)
    })
}
