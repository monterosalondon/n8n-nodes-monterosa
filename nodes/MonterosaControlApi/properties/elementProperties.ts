import { INodeProperties } from 'n8n-workflow';


export const elementProperties: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		options: [
			{
				name: 'Create Element',
				value: 'createElement',
				description: 'Create new element',
				action: 'Create element',
			},
			{
				name: 'Get Elements',
				value: 'getElements',
				description: 'Get all elements of the specified event',
				action: 'Get elements',
			},
			{
				name: 'Update Element',
				value: 'updateElement',
				description: 'Update existing element',
				action: 'Update element',
			},
			{
				name: 'Delete Element',
				value: 'deleteElement',
				description: 'Delete existing element',
				action: 'Delete element',
			},
		],
		default: 'getElements',
		displayOptions: {
			show: {
				resource: ['elements'],
			},
		},
	},
	{
		displayName: 'Event ID',
		name: 'eventId',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['elements'],
				operation: ['getElements', 'createElement'],
			},
		},
	},
	{
		displayName: 'Filter Elements by State',
		name: 'filterState',
		type: 'multiOptions',
	options: [
		{
			name: 'Cancelled',
			value: 'cancelled',
			description: 'Retrieve cancelled elements',
		},
		{
			name: 'Current',
			value: 'current',
			description: 'Retrieve current elements',
		},
		{
			name: 'Future',
			value: 'future',
			description: 'Retrieve future elements',
		},
		{
			name: 'Non Scheduled',
			value: 'non_scheduled',
			description: 'Retrieve non scheduled elements',
		},
		{
			name: 'On Demand',
			value: 'on_demand',
			description: 'Retrieve on demand elements',
		},
		{
			name: 'Past',
			value: 'past',
			description: 'Retrieve past elements',
		},
		{
			name: 'Revoked',
			value: 'revoked',
			description: 'Retrieve revoked elements',
		},
	],
		default: ['non_scheduled'],
		description: 'Filter elements by state (can select multiple)',
		displayOptions: {
			show: {
				resource: ['elements'],
				operation: ['getElements'],
			},
		},
	},
	{
		displayName: 'Include in Latest Results',
		name: 'filterLatest',
		type: 'boolean',
	default: false,
	description: 'Whether to display only elements included in latest results',
		displayOptions: {
			show: {
				resource: ['elements'],
				operation: ['getElements'],
			},
		},
	},
	{
		displayName: 'Include Stats',
		name: 'includeStats',
		type: 'boolean',
	default: false,
	description: 'Whether to include element stats in the response',
		displayOptions: {
			show: {
				resource: ['elements'],
				operation: ['getElements'],
			},
		},
	},
	{
		displayName: 'Element ID',
		name: 'elementId',
		type: 'string',
		default: '123e4567-e89b-12d3-a456-426614174000',
		required: true,
		description: 'ID of the element to update or delete (e.g. 123e4567-e89b-12d3-a456-426614174000)',
		displayOptions: {
			show: {
				resource: ['elements'],
				operation: ['updateElement', 'deleteElement'],
			},
		},
	},
	{
		displayName: 'Correct Option',
		name: 'correctOption',
		type: 'number',
		default: 1,
		description: 'Number of correct option (required for reveal_answer action)',
		displayOptions: {
			show: {
				resource: ['elements'],
				operation: ['updateElement'],
				action: ['reveal_answer', 'reveal_results'],
			},
		},
	},
	{
		displayName: 'Use Custom JSON',
		name: 'useCustomJson',
		type: 'boolean',
		default: false,
		description: 'Whether to use custom JSON instead of the form fields',
		displayOptions: {
			show: {
				resource: ['elements'],
				operation: ['createElement', 'updateElement'],
			},
		},
	},
	{
		displayName: 'Custom JSON',
		name: 'customJson',
		type: 'json',
		default: '{}',
		description: 'Custom JSON request body. See example below for structure.',
		displayOptions: {
			show: {
				resource: ['elements'],
				operation: ['createElement', 'updateElement'],
				useCustomJson: [true],
			},
		},
		hint: `Example JSON structure:
{
  "data": {
    "type": "elements",
    "relationships": {
      "event": {
        "data": {
          "type": "events",
          "id": "event-id-here"
        }
      }
    },
    "attributes": {
      "content_type": "custom",
      "start_mode": "manual",
      "duration": 45,
      "max_votes_per_user": 1,
      "min_options_per_vote": 1,
      "max_options_per_vote": 1,
      "question": {
        "fields": [
          {
            "key": "text",
            "values": {
              "all": "Question Text"
            }
          }
        ],
        "options": [
          {
            "fields": [
              {
                "key": "text",
                "values": {
                  "all": "Option Text #1"
                }
              }
            ]
          }
        ]
      }
    }
  }
}`,
	},
	{
		displayName: 'Content Type Name or ID',
		name: 'contentTypeParts',
		type: 'options',
		required: true,
		description: 'Select the content type for the element. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		placeholder: 'Select Content Type',
		options: [],
		typeOptions: {
			loadOptionsMethod: 'getElementContentTypes',
			loadOptionsDependsOn: ['projectID'],
			loadOptionsParameters: {
				projectID: '={{ $node["Project ID"] }}',
			},
		},
		default: '',
		displayOptions: {
			show: {
				resource: ['elements'],
				operation: ['createElement'],
				useCustomJson: [false],
			},
		},
	},
	{
		displayName: 'Start Mode',
		name: 'startMode',
		type: 'options',
		options: [
			{
				name: 'Manual',
				value: 'manual',
			},
			{
				name: 'Timecode',
				value: 'timecode',
			},
		],
		default: 'manual',
		displayOptions: {
			show: {
				resource: ['elements'],
				operation: ['createElement', 'updateElement'],
				useCustomJson: [false],
			},
		},
	},
	{
		displayName: 'Duration (Seconds)',
		name: 'duration',
		type: 'number',
		default: 45,
		description: 'Element duration in seconds',
		displayOptions: {
			show: {
				resource: ['elements'],
				operation: ['createElement'],
				useCustomJson: [false],
			},
		},
	},
	{
		displayName: 'Offset (Seconds)',
		name: 'offset',
		type: 'number',
		default: 0,
		description: 'Element offset from event start in seconds (required for timecode start mode)',
		displayOptions: {
			show: {
				resource: ['elements'],
				operation: ['createElement'],
				useCustomJson: [false],
				startMode: ['timecode'],
			},
		},
	},

	{
		displayName: 'Question',
		name: 'question',
		type: 'collection',
		default: {},
		displayOptions: {
			show: {
				resource: ['elements'],
				operation: ['createElement', 'updateElement'],
				useCustomJson: [false],
			},
		},
		options: [
			{
				displayName: 'Question Text',
				name: 'text',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Question Image URL',
				name: 'imageUrl',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Custom Fields',
				name: 'customFields',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				description: 'Add custom key-value pairs for the question',
				options: [
					{
						name: 'field',
						displayName: 'Field',
						values: [
							{
								displayName: 'Key',
								name: 'key',
								type: 'string',
								default: '',
								description: 'Field key',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Field value',
							},
						],
					},
				],
			},
		],
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		default: {},
		displayOptions: {
			show: {
				resource: ['elements'],
				operation: ['createElement', 'updateElement'],
				useCustomJson: [false],
			},
		},
		options: [
			{
				name: 'option',
				displayName: 'Option',
				values: [
					{
						displayName: 'Option Text',
						name: 'text',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Option Image URL',
						name: 'imageUrl',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Custom Fields',
						name: 'customFields',
						type: 'fixedCollection',
						typeOptions: {
							multipleValues: true,
						},
						default: {},
						description: 'Add custom key-value pairs for the option',
						options: [
							{
								name: 'field',
								displayName: 'Field',
								values: [
									{
										displayName: 'Key',
										name: 'key',
										type: 'string',
										default: '',
										description: 'Field key',
									},
									{
										displayName: 'Value',
										name: 'value',
										type: 'string',
										default: '',
										description: 'Field value',
									},
								],
							},
						],
					},
				],
			},
		],
	},
	{
		displayName: 'Correct Option',
		name: 'correctOptionIndex',
		type: 'number',
		default: 0,
		description: '1-based index of correct option (required for trivia elements only)',
		displayOptions: {
			show: {
				resource: ['elements'],
				operation: ['createElement', 'updateElement'],
				useCustomJson: [false]
			},
		},
	},
	{
		displayName: 'Voting Settings',
		name: 'votingSettings',
		type: 'collection',
		default: {},
		displayOptions: {
			show: {
				resource: ['elements'],
				operation: ['createElement'],
				useCustomJson: [false],
			},
		},
		options: [
			{
				displayName: 'Certification',
				name: 'certification',
				type: 'boolean',
				default: false,
			},
			{
				displayName: 'Include in Latest Results',
				name: 'includeInLatestResults',
				type: 'boolean',
				default: true,
			},
			{
				displayName: 'Max Options Per Vote',
				name: 'maxOptionsPerVote',
				type: 'number',
				default: 1,
			},
			{
				displayName: 'Max Votes Per User',
				name: 'maxVotesPerUser',
				type: 'number',
				default: 1,
			},
			{
				displayName: 'Min Options Per Vote',
				name: 'minOptionsPerVote',
				type: 'number',
				default: 1,
			},
			{
				displayName: 'Require Verified User',
				name: 'requireVerifiedUser',
				type: 'boolean',
				default: false,
			},
		],
	},
	{
		displayName: 'Localization',
		name: 'localization',
		description: 'Choose how to handle text localization if set to all we wont localize the texts',
		type: 'options',
		options: [
			{
				name: 'All Languages',
				value: 'all',
				description: 'Use the same text for all languages',
			},
			{
				name: 'English Only',
				value: 'en',
				description: 'Use English text only',
			},
		],
		default: 'all',
		displayOptions: {
			show: {
				resource: ['elements'],
				operation: ['createElement', 'updateElement'],
				useCustomJson: [false],
				action: ['update'],
			},
		},
	},
	// <------ END Create Element ------>
	// <------ START Update Element ------>
	{
		displayName: 'Action',
		name: 'action',
		type: 'options',
		options: [
			{
				name: 'Publish',
				value: 'publish',
				description: 'Publish an element',
				action: 'Publish an elements',
			},
			{
				name: 'Reveal Answer',
				value: 'reveal_answer',
				description: 'Reveal the answer of a quiz-element',
				action: 'Reveal answer an elements',
			},
			{
				name: 'Reveal Results',
				value: 'reveal_results',
				description: 'Reveal results of an element',
				action: 'Reveal results an elements',
			},
			{
				name: 'Revoke',
				value: 'revoke',
				description: 'Revoke an element',
				action: 'Revoke an elements',
			},
			{
				name: 'Stop',
				value: 'stop',
				description: 'Stop an active element',
				action: 'Stop an elements',
			},
			{
				name: 'Update Attributes',
				value: 'update',
				description: 'Update element attributes',
				action: 'Update attributes an elements',
			},
		],
		default: 'update',
		displayOptions: {
			show: {
				resource: ['elements'],
				operation: ['updateElement'],
				useCustomJson: [false],
			},
		},
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		default: {},
		displayOptions: {
			show: {
				resource: ['elements'],
				operation: ['updateElement'],
				action: ['update'],
				useCustomJson: [false],
			},
		},
		options: [
			{
				displayName: 'Duration',
				name: 'duration',
				type: 'number',
				default: '',
				description: 'Element duration in seconds',
			},
			{
				displayName: 'Offset',
				name: 'offset',
				type: 'number',
				default: '',
				description: 'Element offset from event start in seconds (required for timecode start mode)',
				displayOptions: {
					show: {
						startMode: ['timecode'],
					},
				},
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				options: [
					{
						name: 'option',
						displayName: 'Option',
						values: [
							{
								displayName: 'Option Text',
								name: 'text',
								type: 'string',
								default: '',
							},
							{
								displayName: 'Custom Fields',
								name: 'customFields',
								type: 'fixedCollection',
								typeOptions: {
									multipleValues: true,
								},
								default: {},
								description: 'Add custom key-value pairs for the option',
								options: [
									{
										name: 'field',
										displayName: 'Field',
										values: [
											{
												displayName: 'Key',
												name: 'key',
												type: 'string',
												default: '',
												description: 'Field key',
											},
											{
												displayName: 'Value',
												name: 'value',
												type: 'string',
												default: '',
												description: 'Field value',
											},
										],
									},
								],
							},
						],
					},
				],
			},
			{
				displayName: 'Question',
				name: 'question',
				type: 'collection',
				default: {},
				options: [
					{
						displayName: 'Question Text',
						name: 'text',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Custom Fields',
						name: 'customFields',
						type: 'fixedCollection',
						typeOptions: {
							multipleValues: true,
						},
						default: {},
						description: 'Add custom key-value pairs for the question',
						options: [
							{
								name: 'field',
								displayName: 'Field',
								values: [
									{
										displayName: 'Key',
										name: 'key',
										type: 'string',
										default: '',
										description: 'Field key',
									},
									{
										displayName: 'Value',
										name: 'value',
										type: 'string',
										default: '',
										description: 'Field value',
									},
								],
							},
						],
					},
				],
			},
			{
				displayName: 'Start Mode',
				name: 'startMode',
				type: 'options',
				options: [
					{
						name: 'Manual',
						value: 'manual',
					},
					{
						name: 'Timecode',
						value: 'timecode',
					},
				],
				default: 'manual',
			},
			{
				displayName: 'Voting Settings',
				name: 'votingSettings',
				type: 'collection',
				default: {},
			options: [
				{
					displayName: 'Certification',
					name: 'certification',
					type: 'boolean',
					default: false,
				},
				{
					displayName: 'Include in Latest Results',
					name: 'includeInLatestResults',
					type: 'boolean',
					default: true,
				},
				{
					displayName: 'Max Options Per Vote',
					name: 'maxOptionsPerVote',
					type: 'number',
					default: 1,
				},
				{
					displayName: 'Max Votes Per User',
					name: 'maxVotesPerUser',
					type: 'number',
					default: 1,
				},
				{
					displayName: 'Min Options Per Vote',
					name: 'minOptionsPerVote',
					type: 'number',
					default: 1,
				},
				{
					displayName: 'Require Verified User',
					name: 'requireVerifiedUser',
					type: 'boolean',
					default: false,
				},
				{
					displayName: 'Reveal Results Mode',
					name: 'revealResultsMode',
					type: 'options',
					options: [
						{
							name: 'Close',
							value: 'close',
						},
						{
							name: 'Event End',
							value: 'event_end',
						},
						{
							name: 'Manual',
							value: 'manual',
						},
						{
							name: 'Never',
							value: 'never',
						},
						{
							name: 'Vote',
							value: 'vote',
						},
					],
					default: 'manual',
				},
			],
			},
		],
	},
	// <------ END Update Element ------>
];
