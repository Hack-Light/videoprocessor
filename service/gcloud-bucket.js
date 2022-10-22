const { Storage } = require('@google-cloud/storage');

let GCS = new Storage({
	keyFile: './key.json',
	projectId: process.env.PROJECTID || 'block-server',
});

// exports.getPublicUrl = (folder, fileName) => `storage.cloud.google.com/block-server.appspot.com/${folder}/${fileName}`;

exports.uploadFromMemory = async (filename, prefix, contents, type) => {
	try {
		console.log(contents);
		await GCS.bucket(process.env.BUCKETNAME || 'block-server.appspot.com')
			.file(`${prefix}/${filename}.${type}`)
			.save(JSON.stringify(contents));

		console.log('file uploaded');
		return true;
	} catch (err) {
		console.log(err);
		return false;
	}
};

exports.downloadAsJson = async (filename, prefix) => {
	console.log('result2');
	try {
		const content = await GCS.bucket(
			process.env.BUCKETNAME || 'block-server.appspot.com',
		)
			.file(`${prefix}/${filename}.json`)
			.download();
		console.log('whatt', JSON.parse(content.toString()));
		return JSON.parse(content.toString('utf8'));
	} catch (error) {
		console.log(error);
	}
};
