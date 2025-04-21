"use client";

import TimeAgo from "react-timeago";

interface Props {
  readonly date: Date | string;
}

const TimeAgoContainer = ({ date }: Props) => {
  return <TimeAgo date={date} />;
};

export default TimeAgoContainer;
