import { INodeProperties } from 'n8n-workflow';

export const listingProperties: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		options: [
			{
				name: 'Get Listings',
				value: 'getListings',
			},
		],
		default: 'getListings',
		displayOptions: {
			show: {
				resource: ['listings'],
			},
		},
	},
];
