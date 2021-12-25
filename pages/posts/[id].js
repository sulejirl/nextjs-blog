import Layout from '../../components/layout'
import Date from '../../components/date'
import Head from 'next/head'
import utilStyles from '../../styles/utils.module.css'
import { gql, useQuery } from "@apollo/client";
import { useRouter } from 'next/router'


const GetPost = gql`
  query getPost($id: ID!) {
    getPost(id: $id) {
      title
      body
      createdAt
      updatedAt
    }
  }
`;

export default function Post() {
  const router = useRouter()
  const { id } = router.query;
  console.log(id)
  const { data, loading, error } = useQuery(GetPost,{variables: {id: id}})
  if(loading) return <p>Loading...</p>
  if(error) return <p>Error...</p>
    return (
      <Layout>
        <Head>
          <title>{data.getPost.title}</title>
        </Head>
        <article>
          <h1 className={utilStyles.headingXl}>{data.getPost.title}</h1>
          <div className={utilStyles.lightText}>
            <Date dateString={data.getPost.createdAt} />
          </div>
          <div dangerouslySetInnerHTML={{ __html: data.getPost.body }} />
        </article>
      </Layout>
    )

}