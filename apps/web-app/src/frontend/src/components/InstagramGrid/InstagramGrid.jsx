import React from "react";
import styled from "styled-components";

const GridContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
`;

export default function InstagramGrid({ username, style, ...props }) {
  const cleanUsername = username ? username.replace('@', '').trim() : '';

  if (!cleanUsername) return null;

  return (
    <GridContainer style={style}>
      <iframe
        src={`https://www.instagram.com/${cleanUsername}/embed`}
        width="100%"
        height="100%"
        frameBorder="0"
        scrolling="yes"
        loading="lazy"
        title={`Instagram Feed of ${cleanUsername}`}
        style={{ minHeight: '300px' }}
        {...props}
      ></iframe>
    </GridContainer>
  );
}
