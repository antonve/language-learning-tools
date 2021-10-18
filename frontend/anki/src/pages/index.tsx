import type { NextPage } from 'next'
import classNames from 'classnames'

import Layout from '@app/components/Layout'
import Sidebar from '@app/components/Sidebar'

const Home: NextPage = () => {
  return (
    <Layout>
      <div className="flex">
        <div className="h-12 w-full md:w-1/4">
          <Sidebar activeId={3} />
        </div>
        <div className="bg-gray-50 h-12 w-full md:w-3/4 rounded-sm">
          <CardWizard />
        </div>
      </div>
    </Layout>
  )
}

export default Home

const CardWizard = () => null
