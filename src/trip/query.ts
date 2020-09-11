import {
    fragmentName as legFields,
    fragments as legFragments,
} from '../fields/Leg'

const variables = {
    numTripPatterns: 'Int!',
    from: 'Location!',
    to: 'Location!',
    dateTime: 'DateTime!',
    arriveBy: 'Boolean!',
    wheelchairAccessible: 'Boolean!',
    modes: 'Modes',
    walkSpeed: 'Float',
    transferSlack: 'Int',
    banned: 'InputBanned',
    whiteListed: 'InputWhiteListed',
}

const declaration = Object.entries(variables)
    .map(([key, value]) => `$${key}: ${value}`)
    .join(',')

const invocation = Object.keys(variables)
    .map((key) => `${key}: $${key}`)
    .join(',')

export const getTripPatternQuery = `
query (${declaration}) {
    trip(${invocation}) {
        tripPatterns {
            startTime
            endTime
            directDuration
            duration
            distance
            walkDistance
            systemNotices {
                tag
                text
            }
            legs {
                ...${legFields}
            }
        }
        metadata {
            searchWindowUsed
            nextDateTime
            prevDateTime
        }
    }
}

${legFragments.join('')}
`
