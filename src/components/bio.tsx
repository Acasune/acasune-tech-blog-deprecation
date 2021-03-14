/**
 * Bio component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.com/docs/use-static-query/
 */

import * as React from "react"
import { useStaticQuery, graphql } from "gatsby"
import { StaticImage } from "gatsby-plugin-image"
import { FaTwitterSquare, FaGithubSquare } from "react-icons/fa";

const Bio = () => {
  const data = useStaticQuery<GatsbyTypes.BioQueryQuery>(graphql`
    query BioQuery {
      site {
        siteMetadata {
          author {
            name
            summary
          }
          description
          social {
            twitter
            github
          }
        }
      }
    }
  `)

  // Set these values by editing "siteMetadata" in gatsby-config.js
  const author = data.site.siteMetadata?.author
  const social = data.site.siteMetadata?.social


  return (
    <div className="bio" >
      <StaticImage
        className="bio-avatar"
        layout="fixed"
        formats={["AUTO", "WEBP", "AVIF"]}
        src="../images/profile-pic.png"
        width={50}
        height={50}
        quality={95}
        alt="Profile picture"
      />

      <div>
        <div>
          {author?.name && (
            <span>
              <strong>{author.name}</strong> {author?.summary || null}
            </span>
          )}
          </div>
          <div>
            <a href={`https://twitter.com/${social?.twitter || ``}`}>
              <FaTwitterSquare  size={32}  color="#A9B7C6" className="bio-icon"/>
            </a>
            <a href={`https://github.com/${social?.github || ``}`}>
              <FaGithubSquare size={32} color="#A9B7C6" className="bio-icon"/>
            </a>
          </div>
        </div>
    </div>
  )
}

export default Bio
