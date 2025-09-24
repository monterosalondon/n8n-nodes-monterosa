import { ICredentialDataDecryptedObject, IExecuteFunctions } from 'n8n-workflow';
import { getUrl } from '../helpers/getUrl';
import { monterosaHttpException } from '../helpers/monterosaHttpException';
import { createLocalizedValues, LocalizationType } from '../helpers/localization';

export async function executeUpdateEventAction(this: IExecuteFunctions, index: number) {
    const credentials = (await this.getCredentials(
        'monterosaControlApi',
        index,
    )) as ICredentialDataDecryptedObject;

    const eventId = this.getNodeParameter('eventId', index) as string;
    const updateType = this.getNodeParameter('updateType', index) as 'attributes' | 'action';
    
    let data: any = {
        "data": {
            "type": "events",
            "id": eventId
        }
    };

    if (updateType === 'action') {
        // Handle action updates (start/stop)
        const action = this.getNodeParameter('action', index) as 'start' | 'stop';
        data.data.attributes = {
            action
        };
    } else {
        // Handle attribute updates
        const eventName = this.getNodeParameter('eventName', index) as string;
        const eventStartAt = this.getNodeParameter('eventStartAtUpdateEvent', index) as string;
        const eventStartMode = this.getNodeParameter('eventStartMode', index) as string;
        const duration = this.getNodeParameter('duration', index, 60) as number;
        const customFields = this.getNodeParameter('customFields', index, {}) as {field: {key: string, value: string}[]};
        const localization = this.getNodeParameter('localization', index, 'en') as LocalizationType;
        const endMode = this.getNodeParameter('endMode', index) as 'duration' | 'scheduled';
        const repeat = this.getNodeParameter('repeat', index) as boolean;
        const repeatIn = this.getNodeParameter('repeatIn', index) as number;

        const startDate = new Date(eventStartAt);
        let eventDuration = duration * 60;

        // Only get end time if not manual start mode
        if (eventStartMode !== 'manual') {
            const eventEndsAt = this.getNodeParameter('eventEndsAt', index, 0) as string;
            if (eventEndsAt === '') {
                throw new Error('Event end time is required for clock start mode');
            }
            const endDate = new Date(eventEndsAt);

            if (endDate <= startDate) {
                throw new Error('Event end time must be after event start time');
            }

            eventDuration = Math.floor((endDate.getTime() - startDate.getTime()) / 1000);
        }

        data.data.attributes = {
            name: eventName,
            start_mode: eventStartMode,
            duration: eventDuration,
            start_at: startDate.getTime() / 1000,
            end_mode: endMode,
            ...(repeat && { repeat: true }),
            ...(repeat && repeatIn && { repeat_in: repeatIn }),
            settings: (customFields?.field || []).map(field => ({
                key: field.key,
                values: createLocalizedValues(field.value, localization)
            }))
        };
    }

    try {
        await this.helpers.httpRequest({
            method: 'PATCH',
            url: `${getUrl(credentials.environment.toString())}/api/v2/events/${eventId}`,
            headers: {
                Authorization: `Bearer ${credentials.accessToken}`,
                Accept: 'application/json',
                'Content-Type': 'application/vnd.api+json',
            },
            body: data
        });
        return {
            eventId: eventId,
            message: 'Event updated successfully'
        }
    } catch (e) {
        throw monterosaHttpException(e, data, 'update');
    }
}