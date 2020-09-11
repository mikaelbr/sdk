export const getNearestPlacesQuery = `
query (
    $latitude: Float!,
    $longitude: Float!,
    $maximumDistance: Float!,
    $maximumResults: Int,
    $filterByPlaceTypes: [FilterPlaceType],
    $filterByModes: [TransportMode],
    $filterByInUse: Boolean,
    $multiModalMode: MultiModalMode
) {
    nearest(
        latitude: $latitude,
        longitude: $longitude,
        maximumDistance: $maximumDistance,
        maximumResults: $maximumResults,
        filterByPlaceTypes: $filterByPlaceTypes,
        filterByModes: $filterByModes,
        filterByInUse: $filterByInUse,
        multiModalMode: $multiModalMode
    ) {
        edges {
            node {
                distance
                place {
                    __typename
                    id
                    latitude
                    longitude
                }
            }
        }
    }
}
`
