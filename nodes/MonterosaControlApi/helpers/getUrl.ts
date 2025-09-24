export const getUrl = (environment: string) => {
    const prefix = environment === 'eu' ? 'studio' : `studio-${environment}`;
    return `https://${prefix}.monterosa.cloud`;
}
export const getCdnUrl = (environment: string) => {
    return `https://cdn-${environment}.monterosa.cloud`;
}
