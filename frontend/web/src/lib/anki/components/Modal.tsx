import React, { FC, ReactNode } from 'react'
import classNames from 'classnames'

interface Props {
  title?: string
  isOpen: boolean
  closeModal: () => void
  children?: ReactNode
}

const Modal: FC<Props> = ({ children, isOpen, closeModal, title }) =>
  isOpen ? (
    <div
      className={classNames(
        'justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none bg-black bg-opacity-50 cursor-pointer',
      )}
      onClick={event => {
        if (event.currentTarget !== event.target) {
          // Only close when background is clicked
          return
        }
        console.log('click')
        closeModal()
      }}
    >
      <div className="relative w-auto my-6 mx-auto max-w-3xl cursor-default">
        <div className="border-0 rounded shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
          {/*header*/}
          {title && (
            <div className="flex justify-between px-8 pt-6 items-stretch">
              <h3 className="text-2xl font-semibold h-full flex-1">{title}</h3>
              <button className="ml-10" onClick={closeModal}>
                <span className="text-gray-400 text-xl w-7 h-7 block outline-none focus:outline-none hover:opacity-50">
                  ×
                </span>
              </button>
            </div>
          )}
          {/*body*/}
          <div className="relative flex-auto">
            <p className="px-8 py-6 text-blueGray-500 text-lg leading-relaxed">
              {children}
            </p>
          </div>
        </div>
      </div>
    </div>
  ) : null

export default Modal
