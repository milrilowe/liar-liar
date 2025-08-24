import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanstackDevtools } from '@tanstack/react-devtools'
import { FullscreenProvider } from '@/providers/FullScreenProvider'


export const Route = createRootRoute({
  component: () => (
    <>
      {/* <Header /> */}
      <FullscreenProvider>
        <div style={{ fontFamily: "KGSummerSunshine" }}>
          <Outlet />
        </div>
      </FullscreenProvider>
      {/* <TanstackDevtools
        config={{
          position: 'bottom-left',
        }}
        plugins={[
          {
            name: 'Tanstack Router',
            render: <TanStackRouterDevtoolsPanel />,
          },
        ]}
      /> */}
    </>
  ),
})
