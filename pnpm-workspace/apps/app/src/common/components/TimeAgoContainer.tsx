"use client";

import TimeAgo from "react-timeago";

type Props = Readonly<{
  date: Date | string;
}>;

const TimeAgoContainer = ({ date }: Props) => {
  return <TimeAgo date={date} />;
};

export default TimeAgoContainer;
