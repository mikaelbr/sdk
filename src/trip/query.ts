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
    wheelchair: 'Boolean!',
    modes: 'Modes',
    transportSubmodes: '[TransportSubmodeFilter]',
    maxPreTransitWalkDistance: 'Float',
    walkSpeed: 'Float',
    transferSlack: 'Int',
    allowBikeRental: 'Boolean',
    useFlex: 'Boolean',
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
