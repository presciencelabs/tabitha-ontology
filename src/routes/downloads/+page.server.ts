// import '$lib'
// import { S3Client, ListObjectsV2Command, type _Object } from '@aws-sdk/client-s3'
// import { NodeHttpHandler } from '@smithy/node-http-handler'
import type { PageServerLoad } from './$types'
// import { CLOUDFLARE_ACCOUNT_ID, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY } from '$env/static/private'


type Backup = {
	name: string,
	size_mb: number,
	created_at: Date,
	url: string,
}

export const load: PageServerLoad = async ({platform}) => {
	console.info('checking for downloads...')

	console.info('R2 bucket:', await platform.env.R2_db_backups.list())
	// const S3 = new S3Client({
	// 	region: 'auto',
	// 	endpoint: `https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
	// 	credentials: {
	// 		accessKeyId: S3_ACCESS_KEY_ID,
	// 		secretAccessKey: S3_SECRET_ACCESS_KEY,
	// 	},
	// 	requestHandler: new NodeHttpHandler(),
	// })

	// const objects = await S3.send(new ListObjectsV2Command({
	// 	Bucket: 'db-backups'
	// }))

	// console.info(`found ${objects.KeyCount} objects`)

	// const backups = objects.Contents?.map(transform).sort(most_recent_first) ?? []
	const backups: Backup[] = []
	return {
		backups: backups,
	}

	// function transform(obj: _Object): Backup {
	// 	return {
	// 		name: obj.Key!,
	// 		size_mb: bytes_to_mb(obj.Size!),
	// 		created_at: new Date(obj.LastModified!),
	// 		url: `https://db-backups.tabitha.bible/${obj.Key}`
	// 	}
	// }

	function bytes_to_mb(bytes: number) {
		return Math.round(bytes / (1024 * 1024))
	}

	function most_recent_first(a: Backup, b: Backup) {
		return b.created_at.getTime() - a.created_at.getTime()
	}
}