// @flow

type BookingMethod = 'callOffice' | 'online'

type BookingContact = {
  phone: string,
  url: string,
}

export type BookingArrangement = {
  bookingAccess: boolean,
  bookingContact: BookingContact,
  latestBookingTime: string,
  bookingMethods?: Array<BookingMethod>,
  bookWhen?: string,
  minimumBookingPeriod?: string,
  bookingNote?: string,
  buyWhen: string,
}

export const fragmentName = 'bookingArrangementFields'

const fragment = `
fragment ${fragmentName} on BookingArrangement {
    bookingMethods
    bookingNote
    minimumBookingPeriod
    bookingContact {
        phone
        url
    }
}
`

export const fragments = [
    fragment,
]
