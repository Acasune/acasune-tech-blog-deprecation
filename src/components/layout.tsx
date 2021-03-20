import * as React from 'react';
import { Link, graphql, useStaticQuery } from 'gatsby';

const Layout = ({ children }) => {
  const rootPath = `${__PATH_PREFIX__}/`;

  const { site } = useStaticQuery<{
    site: {
      siteMetadata: Pick<SiteMetadata, 'title' | 'siteUrl'>;
    };
  }>(
    graphql`
      query {
        site {
          siteMetadata {
            title
          }
        }
      }
    `,
  );
  const siteTitle = site.siteMetadata.title;

  let header = (
    <div>
      <h1 className="main-heading">
        <Link to="/">{siteTitle}</Link>
      </h1>
    </div>
  );

  // if (isRootPath) {
  //   header = (
  //     <div >
  //     <h1 className="main-heading">
  //       <Link to="/">{title}</Link>
  //     </h1>
  //     </div>
  //   )
  // } else {
  //   header = (
  //     <></>
  //   )
  // }

  return (
    <div className="global-wrapper">
      <header className="global-header">{header}</header>
      <main>{children}</main>
      <footer>
        <p>
          このサイトはGoogle Analyticsを使用しています。
          <a
            href="https://policies.google.com/technologies/partner-sites?hl=ja"
            target="_blank"
            rel="external noopener"
          >
            詳しく見る
          </a>
        </p>
        © {new Date().getFullYear()}, Built with
        {` `}
        <a href="https://www.gatsbyjs.com">Gatsby</a>
      </footer>
    </div>
  );
};

export default Layout;
