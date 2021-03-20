import * as React from 'react';
import { Link } from 'gatsby';
import { PageProps } from 'gatsby';
import _ from 'lodash';
import { AiFillTags } from 'react-icons/ai';

import Tag from './tag';

const Post: React.FC<
  PageProps<GatsbyTypes.BlogIndexQuery>
> = ({ post }) => {
  const title = post.frontmatter.title || post.fields.slug;

  return (
    <li key={post.fields.slug}>
      <span>{post.frontmatter.date}</span>
      {` `}
      <Link to={`${post.fields.slug}`} itemProp="url">
        <span itemProp="headline">{title}</span>
      </Link>
      <br />
      <AiFillTags />
      {post.frontmatter.tags.map((tag) => {
        return <Tag tag={tag} />;
      })}
    </li>
  );
};

export default Post;
