import { journeyPlannerQuery, getGraphqlParams } from '../api'
import { BUS, TRAM, RAIL, METRO, WATER, AIR } from '../constants/travelModes'

import { getTripPatternQuery } from './query'

import { legMapper } from './mapper'

import { Location } from '../types/Location'
import { Metadata } from '../../types/Metadata'
import { TransportMode, TransportSubmode } from '../types/Mode'

import { convertFeatureToLocation, isValidDate } from '../utils'

import { createGetFeatures } from '../geocoder'

import { Leg } from '../fields/Leg'

import {
    getServiceConfig,
    mergeConfig,
    ArgumentConfig,
    OverrideConfig,
} from '../config'

interface TripPattern {
    distance: number
    directDuration: number
    duration: number
    endTime: string
    id?: string
    legs: Leg[]
    startTime: string
    walkDistance: number
    systemNotices: Array<{
        tag: string
        text: string
    }>
}

interface InputBanned {
    lines?: string[]
    authorities?: string[]
    organisations?: string[]
    quays?: string[]
    quaysHard?: string[]
    serviceJourneys?: string[]
}

interface InputWhiteListed {
    lines?: string[]
    authorities?: string[]
    organisations?: string[]
}

export enum StreetMode {
    FOOT = 'foot',
    BICYCLE = 'bicycle',
    BIKE_PARK = 'bike_park',
    BIKE_RENTAL = 'bike_rental',
    CAR = 'car',
    CAR_PARK = 'car_park',
    CAR_PICKUP = 'car_pickup',
}

interface Mode {
    transportMode: TransportMode
    transportSubModes?: TransportSubmode[]
}

interface Modes {
    accessMode?: StreetMode | null
    egressMode?: StreetMode | null
    directMode?: StreetMode | null
    transportMode?: Mode[]
}

const DEFAULT_MODES: Modes = {
    accessMode: StreetMode.FOOT,
    egressMode: StreetMode.FOOT,
    directMode: null,
    transportMode: [
        { transportMode: BUS },
        { transportMode: TRAM },
        { transportMode: RAIL },
        { transportMode: METRO },
        { transportMode: WATER },
        { transportMode: AIR },
    ],
}

export interface GetTripPatternsParams {
    from: Location
    to: Location
    arriveBy?: boolean
    limit?: number
    modes?: Modes
    searchDate?: Date
    walkSpeed?: number
    transferSlack?: number
    wheelchairAccessible?: boolean
    banned?: InputBanned
    whiteListed?: InputWhiteListed
}

interface GetTripPatternsVariables {
    from: Location
    to: Location
    arriveBy: boolean
    numTripPatterns: number
    modes: Modes
    dateTime: string
    walkSpeed?: number
    transferSlack?: number
    wheelchairAccessible: boolean
    banned?: InputBanned
    whiteListed?: InputWhiteListed
}

function getTripPatternsVariables(
    params: GetTripPatternsParams,
): GetTripPatternsVariables {
    const {
        from,
        to,
        searchDate = new Date(),
        arriveBy = false,
        modes = DEFAULT_MODES,
        wheelchairAccessible = false,
        limit = 5,
        ...rest
    } = params || {}

    return {
        ...rest,
        from,
        to,
        dateTime: searchDate.toISOString(),
        arriveBy,
        modes,
        wheelchairAccessible,
        numTripPatterns: limit,
    }
}

export function createGetTripPatterns(argConfig: ArgumentConfig) {
    const config = getServiceConfig(argConfig)

    return function getTripPatterns(
        params: GetTripPatternsParams,
        overrideConfig?: OverrideConfig,
    ): Promise<{ tripPatterns: TripPattern[]; metadata?: Metadata }> {
        return journeyPlannerQuery<{
            trip: { tripPatterns: TripPattern[]; metadata?: Metadata }
        }>(
            getTripPatternQuery,
            getTripPatternsVariables(params),
            mergeConfig(config, overrideConfig),
        ).then((data) => {
            const tripPatterns = (data?.trip?.tripPatterns || []).map(
                (trip) => ({
                    ...trip,
                    legs: trip.legs.map(legMapper),
                }),
            )

            return {
                tripPatterns,
                metadata: data?.trip?.metadata,
            }
        })
    }
}

export function getTripPatternsQuery(
    params: GetTripPatternsParams,
): { query: string; variables?: { [key: string]: any } } {
    return getGraphqlParams(
        getTripPatternQuery,
        getTripPatternsVariables(params),
    )
}

export function createFindTrips(argConfig: ArgumentConfig) {
    const getFeatures = createGetFeatures(argConfig)
    const getTripPatterns = createGetTripPatterns(argConfig)

    return async function findTrips(
        from: string,
        to: string,
        date?: Date | string | number,
    ): Promise<TripPattern[]> {
        const searchDate = date ? new Date(date) : new Date()

        if (!isValidDate(searchDate)) {
            throw new Error(
                'Entur SDK: Could not parse <date> argument to valid Date',
            )
        }

        const [fromFeatures, toFeatures] = await Promise.all([
            getFeatures(from),
            getFeatures(to),
        ])

        if (!fromFeatures || !fromFeatures.length) {
            throw new Error(
                `Entur SDK: Could not find any locations matching <from> argument "${from}"`,
            )
        }

        if (!toFeatures || !toFeatures.length) {
            throw new Error(
                `Entur SDK: Could not find any locations matching <to> argument "${to}"`,
            )
        }

        return getTripPatterns({
            from: convertFeatureToLocation(fromFeatures[0]),
            to: convertFeatureToLocation(toFeatures[0]),
            searchDate,
        }).then(({ tripPatterns }) => tripPatterns)
    }
}
