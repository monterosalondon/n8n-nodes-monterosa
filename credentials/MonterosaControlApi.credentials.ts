import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class MonterosaControlApi implements ICredentialType {
	name = 'monterosaControlApi';
	displayName = 'Monterosa Control API';
	documentationUrl = 'https://products.monterosa.co/mic/control-api/overview'; // Optional documentation URL

	properties: INodeProperties[] = [
		{
			displayName: 'Environment',
			name: 'environment',
			type: 'options',
			options: [
				{
					name: 'US',
					value: 'us',
				},
				{
					name: 'EU',
					value: 'eu',
				},
				{
					name: 'DEV',
					value: 'dev',
				},
			],
			default: 'us',
			description: 'Select your Monterosa environment',
		},
		{
			displayName: 'Access Token',
			name: 'accessToken',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
		},
	];
}
