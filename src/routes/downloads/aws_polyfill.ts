// TODO: remove when this is fixed https://github.com/cloudflare/workers-sdk/issues/10755
import { DOMParser } from '@xmldom/xmldom'
globalThis.DOMParser = DOMParser as unknown as typeof globalThis.DOMParser
