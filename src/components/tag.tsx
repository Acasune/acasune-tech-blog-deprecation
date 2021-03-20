import * as React from 'react';
import { Link } from 'gatsby';
import { PageProps } from 'gatsby';
import _ from 'lodash';
import styled from '@emotion/styled';

const Tag: React.FC<
  PageProps<GatsbyTypes.BlogIndexQuery>
> = ({ className, tag }) => {
  return (
    <Link
      to={`/tags/${_.kebabCase(tag)}/`}
      className={className}
    >
      {' '}
      {tag}
    </Link>
  );
};

export const StyledTag = styled(Tag)`
  display: inline-block;
  border-radius: 5px;
  margin: 2px 2px;
  padding: 1px 7px 1px;
  text-decoration: none;
  color: #a9b7c6;
  background-color: #43474a;
  transition: 0.4s;
  :hover {
    background-image: linear-gradient(
      45deg,
      #43474a 0%,
      #43474a 100%
    );
  }
`;

export default StyledTag;
