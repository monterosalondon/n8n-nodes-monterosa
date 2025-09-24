import { INodeProperties } from 'n8n-workflow';


export const eventProperties: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		options: [
			{
				name: 'Create Event',
				value: 'createEvent',
				description: 'Create new event',
				action: 'Create new event',
			},
			{
				name: 'Get Events',
				value: 'getEvents',
				action: 'Get events',
			},
			{
				name: 'Update Event',
				value: 'updateEvent',
				description: 'Update existing event',
				action: 'Update existing event',
			},
			{
				name: 'Get Event History',
				value: 'getEventHistory',
				action: 'Get event history',
			},
		],
		default: 'getEvents',
		displayOptions: {
			show: {
				resource: ['events'],
			},
		},
	},
	{
		displayName: 'Filter by State',
		name: 'filterState',
		type: 'options',
		options: [
			{
				name: 'Future',
				value: 'future',
				description: 'Retrieve future events',
			},
			{
				name: 'Current',
				value: 'current',
				description: 'Retrieve current events',
			},
			{
				name: 'On Demand',
				value: 'on_demand',
				description: 'Retrieve on-demand events',
			},
			{
				name: 'Past',
				value: 'past',
				description: 'Retrieve past events',
			},
		],
		default: 'future',
		description: 'Filter events by state',
		displayOptions: {
			show: {
				resource: ['events'],
				operation: ['getEvents'],
			},
		},
	},
	{
		displayName: 'Only Listings',
		name: 'onlyListings',
		type: 'boolean',
		default: false,
		description: 'Whether to display only events included in listings',
		displayOptions: {
			show: {
				resource: ['events'],
				operation: ['getEvents'],
			},
		},
	},
	{
		displayName: 'Include Relations',
		name: 'include',
		type: 'multiOptions',
		options: [
			{
				name: 'Stats',
				value: 'stats',
				description: 'Include event stats in the response',
			},
			{
				name: 'Project',
				value: 'project',
				description: 'Include project details in the response',
			},
		],
		default: [],
		description: 'Include additional relations in the response',
		displayOptions: {
			show: {
				resource: ['events'],
				operation: ['getEvents'],
			},
		},
	},
	{
		displayName: 'Page Cursor',
		name: 'pageCursor',
		type: 'string',
		default: '',
		description: 'Pagination cursor for retrieving next page of results',
		displayOptions: {
			show: {
				resource: ['events'],
				operation: ['getEvents'],
			},
		},
	},
	{
		displayName: 'Results Per Page',
		name: 'pageCount',
		type: 'number',
		typeOptions: {
			minValue: 1,
			maxValue: 100,
		},
		default: 20,
		description: 'Number of events to retrieve per request',
		displayOptions: {
			show: {
				resource: ['events'],
				operation: ['getEvents'],
			},
		},
	},
	{
		displayName: 'Sort Order',
		name: 'sort',
		type: 'options',
		options: [
			{
				name: 'Newest First',
				value: '-start_time',
				description: 'Sort by newest events first',
			},
			{
				name: 'Oldest First',
				value: 'start_time',
				description: 'Sort by oldest events first',
			},
		],
		default: '-start_time',
		description: 'Order events by start time',
		displayOptions: {
			show: {
				resource: ['events'],
				operation: ['getEvents'],
			},
		},
	},
	// <---- Create event settings ------>
	{
		displayName: 'Event Name',
		name: 'eventName',
		type: 'string',
		default: '',
		description: 'Name of the event to be created',
		displayOptions: {
			show: {
				resource: ['events'],
				operation: ['createEvent'],
			},
		},
	},
	{
		displayName: 'Event Start Mode',
		name: 'eventStartMode',
		type: 'options',
		default: 'manual',
		description: 'Start mode, one of : "manual", "clock"',
		options: [
			{
				name: 'Manual',
				value: 'manual',
				action: '',
			},
			{
				name: 'Clock',
				value: 'clock',
				action: '',
			},
		],
		displayOptions: {
			show: {
				resource: ['events'],
				operation: ['createEvent'],
			},
		},
	},
	{
		displayName: 'Event Start At',
		name: 'eventStartAt',
		type: 'dateTime',
		default: '',
		description: 'Planned event start time (timestamp)',
		displayOptions: {
			show: {
				resource: ['events'],
				operation: ['createEvent'],
				eventStartMode: ['clock']
			},
		},
	},
	{
		displayName: 'Event End Time',
		name: 'eventEndsAt',
		type: 'dateTime',
		default: '',
		description: 'When the event should end',
		displayOptions: {
			show: {
				resource: ['events'],
				operation: ['createEvent'],
				eventStartMode: ['clock']
			}
		},
		typeOptions: {
			dateTime: {
				minValue: 'now'
			}
		}
	},
	{
		displayName: 'Duration',
		name: 'duration',
		type: 'number',
		default: 60,
		description: 'Duration of the event in minutes',
		displayOptions: {
			show: {
				resource: ['events'],
				operation: ['createEvent'],
				eventStartMode: ['manual'],

			},
		},
	},
	{
		displayName: 'Custom Fields',
		name: 'customFields',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		displayOptions: {
			show: {
				resource: ['events'],
				operation: ['createEvent'],
			},
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
	{
		displayName: 'Localization',
		name: 'localization',
		type: 'string',
		default: 'all',
		description: 'Localization of the custom fields',
	},
	// <---- END  Create event settings ------>
	// <----- START Update event settings ----->
	{
		displayName: "Event ID",
		name: "eventId",
		type: "string",
		default: "",
		description: 'ID of event to be updated',
		displayOptions: {
			show: {
				resource: ["events"],
				operation: ["updateEvent", "getEventHistory"]
			}
		}
	},
	{
		displayName: "Event Start Time",
		name: "eventStartTime",
		type: "dateTime",
		default: "",
		displayOptions: {
			show: {
				resource: ["events"],
				operation: ["updateEvent"]
			}
		}
	},
	{
		displayName: 'Update Type',
		name: 'updateType',
		type: 'options',
		default: 'attributes',
		description: 'What to update in the event',
		displayOptions: {
			show: {
				resource: ['events'],
				operation: ['updateEvent']
			}
		},
		options: [
			{
				name: 'Attributes',
				value: 'attributes',
				description: 'Update event attributes and settings'
			},
			{
				name: 'Action',
				value: 'action',
				description: 'Perform an action on the event (start/stop)'
			}
		]
	},
	{
		displayName: 'Action',
		name: 'action',
		type: 'options',
		default: 'start',
		displayOptions: {
			show: {
				resource: ['events'],
				operation: ['updateEvent'],
				updateType: ['action']
			}
		},
		options: [
      {
        name: 'Start',
        value: 'start',
        description: 'Start the event',
        action: 'Start an event',
      },
      {
        name: 'Stop',
        value: 'stop',
        description: 'Stop the event',
        action: 'Stop an event',
      }
		]
	},
	{
		displayName: 'Event Name',
		name: 'eventName',
		type: 'string',
		default: '',
		description: 'Name of the event to be updated',
		displayOptions: {
			show: {
				resource: ['events'],
				operation: ['updateEvent'],
				updateType: ['attributes']
			}
		}
	},
	{
		displayName: 'Event Start Mode',
		name: 'eventStartMode',
		type: 'options',
		default: 'manual',
		description: 'Start mode, one of : "manual", "clock"',
		displayOptions: {
			show: {
				resource: ['events'],
				operation: ['updateEvent'],
				updateType: ['attributes']
			}
		},
		options: [
			{
				name: 'Manual',
				value: 'manual'
			},
			{
				name: 'Clock',
				value: 'clock'
			}
		]
	},
	{
		displayName: 'Event Start At',
		name: 'eventStartAtUpdateEvent',
		type: 'dateTime',
		default: '',
		description: 'Planned event start time (timestamp)',
		displayOptions: {
			show: {
				resource: ['events'],
				operation: ['updateEvent'],
				updateType: ['attributes'],
				eventStartMode: ['clock']
			}
		}
	},
	{
		displayName: 'Event End Time',
		name: 'eventEndsAt',
		type: 'dateTime',
		default: '',
		description: 'When the event should end',
		displayOptions: {
			show: {
				resource: ['events'],
				operation: ['updateEvent'],
				updateType: ['attributes'],
				eventStartMode: ['clock'],
				endMode: ['scheduled']
			}
		}
	},
	{
		displayName: 'Duration',
		name: 'duration',
		type: 'number',
		default: 60,
		description: 'Duration of the event in minutes',
		displayOptions: {
			show: {
				resource: ['events'],
				operation: ['updateEvent'],
				updateType: ['attributes'],
				eventStartMode: ['manual']
			}
		}
	},
	{
		displayName: 'End Mode',
		name: 'endMode',
		type: 'options',
		default: 'duration',
		description: 'How the event should end',
		displayOptions: {
			show: {
				resource: ['events'],
				operation: ['updateEvent'],
				updateType: ['attributes'],
				eventStartMode: ['clock']
			}
		},
		options: [
			{
				name: 'Duration',
				value: 'duration'
			},
			{
				name: 'Scheduled',
				value: 'scheduled'
			}
		]
	},
	{
		displayName: 'Repeat',
		name: 'repeat',
		type: 'boolean',
		default: false,
		description: 'Whether to repeat the event',
		displayOptions: {
			show: {
				resource: ['events'],
				operation: ['updateEvent'],
				updateType: ['attributes']
			}
		}
	},
	{
		displayName: 'Repeat Interval (Minutes)',
		name: 'repeatIn',
		type: 'number',
		default: 60,
		description: 'When to start repeat event after previous event end, in minutes',
		displayOptions: {
			show: {
				resource: ['events'],
				operation: ['updateEvent'],
				updateType: ['attributes'],
				repeat: [true]
			}
		}
	},
	{
		displayName: 'Custom Fields',
		name: 'customFields',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		displayOptions: {
			show: {
				resource: ['events'],
				operation: ['updateEvent'],
				updateType: ['attributes']
			}
		},
		default: {},
		description: 'Add custom key-value pairs for the event',
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
	// <----- END Update event settings -------->
];
