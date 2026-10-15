// Carrega o SDK do Mercado Pago de forma lazy (promise cacheada)
// Evita adicionar ~200KB ao bundle inicial — carregado apenas no checkout

let sdkPromise: Promise<void> | null = null

export function loadMercadoPagoSdk(): Promise<void> {
  if (sdkPromise) return sdkPromise

  sdkPromise = new Promise<void>((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('SDK nao disponivel fora do browser'))
      return
    }

    // Ja foi carregado anteriormente
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).MercadoPago) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://sdk.mercadopago.com/js/v2'
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => {
      sdkPromise = null // permite retry
      reject(new Error('Falha ao carregar o SDK do Mercado Pago. Verifique sua conexao.'))
    }
    document.head.appendChild(script)
  })

  return sdkPromise
}
