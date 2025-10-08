import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
	Icon,
} from 'n8n-workflow';

export class MonterosaControlApi implements ICredentialType {
	name = 'monterosaControlApi';
	displayName = 'Monterosa Control API';
	description = 'Interact with Monterosa Control API';
	
	icon: Icon = 'file:monterosa.svg';
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

    authenticate: IAuthenticateGeneric = {
        type: 'generic',
        properties: {
            headers: {
                Authorization: '={{ "Bearer " + $credentials.accessToken }}',
            },
        },
    };
	test: ICredentialTestRequest = {
		request: {
			baseURL:
				'={{ $credentials.environment === "eu" ? "https://studio.monterosa.cloud" : "https://studio-" + $credentials.environment + ".monterosa.cloud" }}',
			url: '/api/v2/me',
			method: 'GET',
		}
	};
}
