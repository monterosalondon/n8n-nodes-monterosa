import {
	ICredentialDataDecryptedObject,
	IExecuteFunctions,
	NodeApiError,
	NodeOperationError,
} from 'n8n-workflow';
import { getUrl } from '../helpers/getUrl';
import { createLocalizedValues, LocalizationType } from '../helpers/localization';
import { getMonterosaErrorDescription } from '../helpers/getMonterosaErrorDescription';

export async function executeCreateEventAction(this: IExecuteFunctions, index: number) {
    const credentials = (await this.getCredentials(
        'monterosaControlApi',
        index,
    )) as ICredentialDataDecryptedObject;
    const eventName = this.getNodeParameter('eventName', index) as string;
    const eventStartAt = this.getNodeParameter('eventStartAt', index, 0) as string;
    const eventStartMode = this.getNodeParameter('eventStartMode', index, 'manual') as string;
    const duration = this.getNodeParameter('duration', index, 60) as number;
    const projectId = this.getNodeParameter('projectID', index) as string;
    const customFields = this.getNodeParameter('customFields', index, {}) as {field: {key: string, value: string}[]};
    const localization = this.getNodeParameter('localization', index, 'en') as LocalizationType;
    const startDate = new Date(eventStartAt);
    let eventDuration = duration * 60;

    // Only get end time if not manual start mode
    if (eventStartMode !== 'manual') {
        const eventEndsAt = this.getNodeParameter('eventEndsAt', index, 0) as string;
        //if eventEndsAt is empty, throw an error
        if (eventEndsAt === '') {
            throw new NodeOperationError(this.getNode(), 'Event end time is required for clock start mode');
        }
        const endDate = new Date(eventEndsAt);

        // Validate that end date is after start date
        if (endDate <= startDate) {
            throw new NodeOperationError(this.getNode(), 'Event end time must be after event start time');
        }

        // Calculate duration in milliseconds and convert to seconds
        eventDuration = Math.floor((endDate.getTime() - startDate.getTime()) / 1000);
    }
 
    const data = {
        "data": {
            "type": "events",
            "relationships": {
                "project": {
                    "data": {
                        "type": "projects",
                        "id": projectId
                    }
                }
            },
            "attributes": {
                "name": eventName,
                "start_mode": eventStartMode,
                "duration": eventDuration,
                "start_at": startDate.getTime() / 1000,
                "end_mode": "duration",
                "settings": (customFields?.field || []).map(field => ({
                    key: field.key,
                    values: createLocalizedValues(field.value, localization)
                }))
            }
        }
    };

    try {
        const responseData = await this.helpers.httpRequestWithAuthentication.call(
            this,
            'monterosaControlApi',
            {
                method: 'POST',
                url: `${getUrl(credentials.environment.toString())}/api/v2/events`,
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/vnd.api+json',
                },
                body: data,
            },
        );
        return responseData;
    } catch (error) {
        throw new NodeApiError(this.getNode(), error, {
            message: 'Failed to create event',
            description: getMonterosaErrorDescription(error),
        });
    }
}