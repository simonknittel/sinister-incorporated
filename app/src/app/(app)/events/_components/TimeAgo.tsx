"use client";

import TimeAgo from "react-timeago";

interface Props {
  date: Date;
}

const TimeAgoContainer = ({ date }: Props) => {
  return <TimeAgo date={date} />;
};

export default TimeAgoContainer;
