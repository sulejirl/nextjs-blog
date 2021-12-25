import { parseISO, format, fromUnixTime } from 'date-fns'

export default function Date({ dateString }) {
  if(dateString) {
    const date = fromUnixTime(dateString/1000)
    return <time dateTime={dateString}>{format(date, 'LLLL d, yyyy')}</time>
  } else {
    return <>No Time Specified</>
  }

}