import { graphql } from "gatsby"
import React from "react"

import Bio from "../components/bio"
import Layout from "../components/layout"
import Post from "../components/post"
import SEO from "../components/seo"


const Tags = ({ pageContext, data }) => {
  const {tag} = pageContext

  return (
    <Layout >
    <SEO title={tag} />
    <h2>You search: {tag}</h2>
    <ol style={{ listStyle: `none`}}>
    {data.allMarkdownRemark.edges.map(({ node }) => {
        return (
          <Post
          post={node}
          />
        )
      })}
    </ol>
    <hr />
    <Bio />
  </Layout>
  )
}

export default Tags

export const pageQuery = graphql`

  query($tag: String) {
    allMarkdownRemark(
      limit: 1000
      sort: { fields: [frontmatter___date], order: DESC }
      filter: { frontmatter: { tags: { in: [$tag] } } }
    ) {
      totalCount
      edges {
        node {
          excerpt(truncate: true)
          fields {
            slug
          }
          frontmatter {
            title
            date(formatString: "YYYY-MM-DD")
            tags
          }
        }
      }
    }
  }
`
