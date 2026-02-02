export type PublicAccessConfig = {
    publishedField?: string
    publishedValue?: string
    publishedAtField?: string
}

export const publicModels: Record<string, PublicAccessConfig> = {
    pages: {
        publishedField: 'status',
        publishedValue: 'published',
    },
}
