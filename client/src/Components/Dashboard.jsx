import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { ArrowRight, X, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from 'react-router-dom'

function Dashboard() {
  const [expenses, setExpenses] = useState([])
  const [expensePopup, setExpensePopup] = useState(false)
  const [currentExpense, setCurrentExpense] = useState(null)
  const [totalExpenseOfAUserInOneExpense, setTotalExpenseOfAUserInOneExpense] = useState([])
  const [minimumtransactionOfUserInAllExpenses, setMinimumtransactionOfUserInAllExpenses] = useState([])
  const [amountOwedByUser, setAmountOwedByUser] = useState()
  const [amountToBeRecievedByUserTotal, setAmountToBeRecievedByUserTotal] = useState()
  const token = localStorage.getItem('token')
  const [usernameOfCurrentUser, setUsernameOfCurrentUser] = useState("")
  const [limit] = useState(5)
  const navigate = useNavigate()
  const [pagePart, setPage] = useState(1)
  const [numberOfPages, setNumberOfPages] = useState(1)

  const getCurrentUser = async () => {
    try {
      const res = await axios.get('http://localhost:3000/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUsernameOfCurrentUser(res.data.username)
    } catch (err) {
      console.log("error getting current user info for dashboard")
    }
  }

  const getAllExpenses = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/expenses/dashboard/${pagePart}/${limit}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setNumberOfPages(Math.ceil(res.data.totalNumberOfExpenses.length / limit))
      setExpenses(res.data.allexpensesGivenToFrontend)
    } catch (err) {
      console.log("error getting all expenses", err)
    }
  }

  const minimumTransactionOfUserInAllExpneses = async () => {
    try {
      const res = await axios.get('http://localhost:3000/expenses/minimumTransactionInAllExpenses', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setTotalExpenseOfAUserInOneExpense(res.data.amountToBePaidByCurrentUser)
      setMinimumtransactionOfUserInAllExpenses(res.data.minimumtransactionOfUserInAllExpenses)
      setAmountOwedByUser(res.data.amountOwedByUserTotal[0].totalAmount)
      setAmountToBeRecievedByUserTotal(res.data.amountToBeRecievedByUserTotal[0].totalAmount)
    } catch (err) {
      console.log("error getting minimum transaction", err)
    }
  }

  const openExpense = (expense) => {
    setCurrentExpense(expense)
    setExpensePopup(true)
    document.body.style.overflow = "hidden"
    document.documentElement.style.overflow = "hidden"
  }

  const closeExpense = () => {
    setExpensePopup(false)
    document.body.style.overflow = "auto"
    document.documentElement.style.overflow = "auto"
  }

  // Build O(1) lookup for per-expense balances
  const balanceLookup = useMemo(() => {
    const map = new Map()
    totalExpenseOfAUserInOneExpense.forEach((entry) => {
      map.set(entry._id, entry.finalResult?.amount ?? 0)
    })
    return map
  }, [totalExpenseOfAUserInOneExpense])

  useEffect(() => {
    minimumTransactionOfUserInAllExpneses()
    getCurrentUser()
  }, [])

  useEffect(() => {
    getAllExpenses()
  }, [pagePart])

  const netBalance = minimumtransactionOfUserInAllExpenses[0]?.totalAmount ?? 0

  return (
    <div className="bg-[#f7f9fc] min-h-screen">

      {/* Expense detail popup */}
      <AnimatePresence>
        {expensePopup && currentExpense && (
          <motion.div
            className="inset-0 fixed flex justify-center items-center h-screen w-screen backdrop-blur-sm bg-black/50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeExpense}
          >
            <motion.div
              className="bg-white border border-[#1e2230]/10 min-h-95 w-[90%] max-w-[500px] rounded-2xl shadow-xl pb-6"
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center px-6 pt-5 pb-3 border-b border-[#1d4ed8]/10">
                <p className="text-[#1e4ed8] text-2xl font-bold">{currentExpense.expenseName}</p>
                <button
                  className="cursor-pointer text-[#1d4ed8] hover:bg-[#1d4ed8]/10 rounded-full p-1.5 transition-colors"
                  onClick={closeExpense}
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="px-6 pt-4 flex flex-col items-start">
                {currentExpense.expenseDescription && (
                  <p className="text-gray-600 w-[95%]">{currentExpense.expenseDescription}</p>
                )}

                <div className="mt-4 space-y-1.5">
                  <p><span className="text-[#2563eb] font-semibold text-[18px]">Payer</span> : {currentExpense.paidBy}</p>
                  <p><span className="text-[#2563eb] font-semibold text-[18px]">Total Amount</span> : {currentExpense.totalAmount}</p>
                  <p><span className="text-[#2563eb] font-semibold text-[18px]">Split Type</span> : {currentExpense.splitType}</p>
                </div>

                <div className="mt-5 flex flex-col w-[95%]">
                  <p className="text-[#2563eb] font-semibold text-[18px] mb-2">Contributors</p>
                  <div className="flex flex-col gap-2">
                    {currentExpense.percentages &&
                      Object.entries(currentExpense.percentages).map(([user, value]) => {
                        const contributorsLength = currentExpense.contributorsLength || 1
                        const displayValue = currentExpense.splitType === "Percentage"
                          ? `${value} %`
                          : `${(currentExpense.totalAmount / contributorsLength).toFixed(2)} /-`
                        return (
                          <div key={user} className="flex justify-between items-center bg-[#f7f9fc] rounded-lg px-3 py-1.5">
                            <span className="text-gray-700">{user}</span>
                            <span className="font-medium text-[#1e2230]">{displayValue}</span>
                          </div>
                        )
                      })}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="md:ml-60 px-6 md:px-10 py-8 max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <p className="text-sm text-gray-400 mb-1">Welcome back, {usernameOfCurrentUser}</p>
          <p className="text-3xl md:text-4xl font-bold text-[#1d4ed8]">Dashboard</p>
        </div>

        {/* Overview cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {/* Net Balance */}
          <div className="bg-white rounded-2xl border border-[#1d4ed8]/10 shadow-sm p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-500">Net Balance</p>
              <div className="bg-[#1d4ed8]/8 rounded-full p-2">
                <Wallet size={16} className="text-[#1d4ed8]" />
              </div>
            </div>
            <p className={`text-3xl font-bold ${netBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
              {netBalance.toFixed(2)}
            </p>
          </div>

          {/* Amount Owed */}
          <div className="bg-white rounded-2xl border border-[#1d4ed8]/10 shadow-sm p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-500">You Owe</p>
              <div className="bg-red-50 rounded-full p-2">
                <TrendingDown size={16} className="text-red-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-red-600">
              {amountOwedByUser?.toFixed(2) ?? "0.00"}
            </p>
          </div>

          {/* Amount to Receive */}
          <div className="bg-white rounded-2xl border border-[#1d4ed8]/10 shadow-sm p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-500">You'll Receive</p>
              <div className="bg-green-50 rounded-full p-2">
                <TrendingUp size={16} className="text-green-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-green-600">
              {amountToBeRecievedByUserTotal?.toFixed(2) ?? "0.00"}
            </p>
          </div>
        </div>

        {/* Expenses table */}
        <div className="bg-white rounded-2xl border border-[#1d4ed8]/10 shadow-sm overflow-hidden">
          {/* Table header */}
          <div className="flex justify-between items-center px-6 md:px-8 py-5 border-b border-[#1d4ed8]/10">
            <p className="text-xl font-semibold text-[#1d4ed8]">Recent Expenses</p>
            <button
              className="bg-[#1d4ed8] text-white py-2 px-4 rounded-lg flex items-center gap-1.5 text-sm font-medium hover:bg-[#1742b8] transition-colors cursor-pointer"
              onClick={() => navigate('/expenses')}
            >
              View All <ArrowRight size={15} />
            </button>
          </div>

          {/* Column headings */}
          <div className="flex justify-evenly items-center bg-gray-50 py-3 border-b border-gray-100 text-gray-400 text-xs uppercase tracking-wide">
            <p className="w-[14vw] flex justify-center">#</p>
            <p className="w-[14vw] flex justify-center">Title</p>
            <p className="w-[14vw] flex justify-center">Paid By</p>
            <p className="w-[14vw] flex justify-center">Amount</p>
            <p className="w-[14vw] flex justify-center">Your Share</p>
            <p className="w-[14vw] flex justify-center" />
          </div>

          {/* Rows */}
          {expenses.length === 0 && (
            <div className="py-12 text-center text-gray-400">No expenses yet.</div>
          )}

          {expenses.map((expense, index) => {
            const balance = balanceLookup.get(expense._id) ?? 0
            const isPositive = balance >= 0
            return (
              <div
                className="flex justify-evenly items-center border-b border-gray-100 last:border-b-0 py-5 hover:bg-[#f5f8ff] transition-colors"
                key={expense._id ?? index}
              >
                <p className="w-[14vw] flex justify-center text-gray-400 text-sm">
                  {(pagePart - 1) * limit + index + 1}
                </p>
                <p className="w-[14vw] flex justify-center font-medium text-[#1e2230] text-sm">{expense.expenseName}</p>
                <p className="w-[14vw] flex justify-center text-gray-500 text-sm">{expense.paidBy}</p>
                <p className="w-[14vw] flex justify-center text-gray-700 text-sm">{Number(expense.totalAmount).toFixed(2)}</p>
                <p className={`w-[14vw] flex justify-center text-lg font-semibold ${isPositive ? "text-green-600" : "text-red-600"}`}>
                  {balance.toFixed(2)}
                </p>
                <button
                  className="w-[14vw] flex justify-center text-[#1d4ed8] text-sm hover:underline cursor-pointer font-medium"
                  onClick={() => openExpense(expense)}
                >
                  View
                </button>
              </div>
            )
          })}


          {/* Pagination */}
          <div className="flex justify-end items-center gap-3 px-6 py-4 border-t border-gray-100">
            <span className="text-sm text-gray-400">Page {pagePart} of {numberOfPages}</span>
            <button
              className="p-1.5 rounded-lg text-gray-400 hover:text-[#1d4ed8] hover:bg-[#1d4ed8]/8 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={pagePart <= 1}
              aria-label="Previous page"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              className="p-1.5 rounded-lg text-gray-400 hover:text-[#1d4ed8] hover:bg-[#1d4ed8]/8 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              onClick={() => setPage(p => Math.min(numberOfPages, p + 1))}
              disabled={pagePart >= numberOfPages}
              aria-label="Next page"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Dashboard