import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { X, Search } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const TIME_FILTERS = ['None', 'Today', 'This Week', 'This Month', 'This Year', 'Other']



function getTimeBuckets(createdAt) {
    if (!createdAt) return ['None']
    const diffDays = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)

    if (diffDays < 1) return ['Today', 'This Week', 'This Month', 'This Year', 'None']
    if (diffDays < 7) return ['This Week', 'This Month', 'This Year', 'None']
    if (diffDays < 31) return ['This Month', 'This Year', 'None']
    if (diffDays / 31 < 12) return ['This Year', 'None']
    return ['Other', 'None']
}

function Expenses() {
    const [expenses, setExpenses] = useState([])
    const [loading, setLoading] = useState(true)
    const [expensePopup, setExpensePopup] = useState(false)
    const [currentExpense, setCurrentExpense] = useState(null)

    const [balancesByExpense, setBalancesByExpense] = useState([])

    const [searchInput, setSearchInput] = useState('')
    const [timeFilter, setTimeFilter] = useState('None')

    const token = localStorage.getItem('token')

    const getAllExpenses = async () => {
        try {
            const res = await axios.get('http://localhost:3000/expenses/', {
                headers: { Authorization: `Bearer ${token}` },
            })
            setExpenses(res.data.allexpensesGivenToFrontend || [])
        } catch (err) {
            console.log('error getting all expenses', err)
        } finally {
            setLoading(false)
        }
    }

    const minimumTransactionOfUserInAllExpneses = async () => {
        try {
            const res = await axios.get('http://localhost:3000/expenses/minimumTransactionInAllExpenses', {
                headers: { Authorization: `Bearer ${token}` },
            })
            setBalancesByExpense(res.data.amountToBePaidByCurrentUser || [])
        } catch (err) {
            console.log('error getting minimum transaction of user in all expenses', err)
        }
    }

    useEffect(() => {
        getAllExpenses()
        minimumTransactionOfUserInAllExpneses()
    }, [])

    // O(1) lookup instead of a nested .map() inside .map() per row
    const balanceLookup = useMemo(() => {
        const map = new Map()
        balancesByExpense.forEach((entry) => map.set(entry._id, entry.finalResult?.amount ?? 0))
        return map
    }, [balancesByExpense])

    const visibleExpenses = useMemo(() => {
        const query = searchInput.trim().toLowerCase()
        return expenses.filter((expense) => {
            const matchesSearch = expense.expenseName?.toLowerCase().includes(query)
            const matchesTime = getTimeBuckets(expense.createdAt).includes(timeFilter)
            return matchesSearch && matchesTime
        })
    }, [expenses, searchInput, timeFilter])

    const openExpense = (expense) => {
        setCurrentExpense(expense)
        setExpensePopup(true)
        document.body.style.overflow = 'hidden'
        document.documentElement.style.overflow = 'hidden'
    }

    const closeExpense = () => {
        setExpensePopup(false)
        document.body.style.overflow = 'auto'
        document.documentElement.style.overflow = 'auto'
    }

    return (
        <div>
            <AnimatePresence>
                {expensePopup && currentExpense && (
                    <motion.div
                        className="inset-0 fixed flex justify-center items-center h-screen w-screen backdrop-blur-sm bg-black/50 z-50"
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        onClick={closeExpense}
                    >
                        <div
                            className="bg-[#eef3ff] border border-[#1e2230]/10 min-h-95 w-[90%] max-w-[500px] rounded-xl shadow-xl pb-6"
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
                                    <p>
                                        <span className="text-[#2563eb] font-semibold text-[18px]">Payer</span> :{' '}
                                        {currentExpense.paidBy}
                                    </p>
                                    <p>
                                        <span className="text-[#2563eb] font-semibold text-[18px]">Total Amount</span> :{' '}
                                        {currentExpense.totalAmount}
                                    </p>
                                    <p>
                                        <span className="text-[#2563eb] font-semibold text-[18px]">Split Type</span> :{' '}
                                        {currentExpense.splitType}
                                    </p>
                                </div>

                                <div className="mt-5 flex flex-col w-[95%]">
                                    <p className="text-[#2563eb] font-semibold text-[18px] mb-2">Contributors</p>
                                    <div className="flex flex-col gap-2">
                                        {currentExpense.percentages &&
                                            Object.entries(currentExpense.percentages).map(([user, value]) => {
                                                const contributorsLength = currentExpense.contributorsLength || 1
                                                const displayValue =
                                                    currentExpense.splitType === 'Percentage'
                                                        ? `${value} %`
                                                        : `${(currentExpense.totalAmount / contributorsLength).toFixed(2)} /-`
                                                return (
                                                    <div key={user} className="flex justify-between items-center bg-white/60 rounded-lg px-3 py-1.5">
                                                        <span className="text-gray-700">{user}</span>
                                                        <span className="font-medium text-[#1e2230]">{displayValue}</span>
                                                    </div>
                                                )
                                            })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex justify-center items-center flex-col md:ml-60">
                <div className="flex justify-between items-center mr-6 ml-6 my-6 w-[95%] mb-6">
                    <p className="text-4xl font-bold text-[#1d4ed8]">Your Expenses!</p>
                </div>

                <div className="flex items-center justify-between w-130 bg-white rounded-full border py-2 px-3 gap-2 border-[#c5cdde] mt-5 mb-5 shadow-sm focus-within:border-[#1d4ed8] transition-colors">
                    <div className="flex justify-start items-center w-[90%] gap-4">
                        <Search className="text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search By Expense Name"
                            className="outline-none text-md w-full bg-transparent"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                        />
                    </div>

                    <X
                        className={`cursor-pointer mr-2 text-gray-400 hover:text-[#1d4ed8] transition-colors ${
                            searchInput.trim() === '' ? 'opacity-0' : 'opacity-100'
                        }`}
                        size={18}
                        onClick={() => setSearchInput('')}
                    />
                </div>

                <div className="flex justify-start w-[70vw] gap-5 my-3 flex-col mb-5">
                    <div className="flex gap-10 items-center">
                        <p className="text-gray-500">Filter By :</p>
                        <div className="flex gap-8 flex-wrap">
                            {TIME_FILTERS.map((filter) => (
                                <p
                                    key={filter}
                                    className={`cursor-pointer pb-0.5 border-b-2 transition-colors ${
                                        timeFilter === filter
                                            ? 'text-[#1d4ed8] border-[#1d4ed8] font-medium'
                                            : 'text-gray-600 border-transparent hover:text-[#1d4ed8]/70'
                                    }`}
                                    onClick={() => setTimeFilter(filter)}
                                >
                                    {filter}
                                </p>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="border border-[#1d4ed8]/15 rounded-xl mb-10 mt-3 w-[70vw] overflow-hidden shadow-sm">
                    <div className="flex justify-evenly items-center border-b border-b-gray-200 bg-gray-50 py-3 text-gray-500 text-sm uppercase tracking-wide">
                        <p className="w-[14vw] flex justify-center items-center">Index</p>
                        <p className="w-[14vw] flex justify-center items-center">Title</p>
                        <p className="w-[14vw] flex justify-center items-center">Paid By</p>
                        <p className="w-[14vw] flex justify-center items-center">Amount</p>
                        <p className="w-[14vw] flex justify-center items-center">Your Contribution</p>
                        <span className="w-[14vw] flex justify-center items-center" />
                    </div>

                    {loading && <div className="py-12 text-center text-gray-400">Loading your expenses…</div>}

                    {!loading && visibleExpenses.length === 0 && (
                        <div className="py-12 text-center text-gray-400">
                            {expenses.length === 0 ? 'No expenses yet.' : 'No expenses match your search or filter.'}
                        </div>
                    )}

                    {!loading &&
                        visibleExpenses.map((expense, index) => {
                            const balance = balanceLookup.get(expense._id) ?? 0
                            const isPositive = balance >= 0

                            return (
                                <div
                                    className="flex justify-evenly items-center border-b border-b-gray-200 last:border-b-0 py-6 hover:bg-[#f5f8ff] transition-colors"
                                    key={expense._id ?? index}
                                >
                                    <p className="w-[14vw] flex justify-center items-center text-gray-400">{index + 1}</p>
                                    <p className="w-[14vw] flex justify-center items-center font-medium text-[#1e2230]">{expense.expenseName}</p>
                                    <p className="w-[14vw] flex justify-center items-center text-gray-600">{expense.paidBy}</p>
                                    <p className="w-[14vw] flex justify-center items-center text-gray-700">{Number(expense.totalAmount).toFixed(2)}</p>
                                    <p className={`w-[14vw] flex justify-center items-center text-xl font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                        {balance.toFixed(2)}
                                    </p>
                                    <button
                                        className="w-[14vw] flex justify-center items-center cursor-pointer text-[#1d4ed8] hover:underline"
                                        onClick={() => openExpense(expense)}
                                    >
                                        View
                                    </button>
                                </div>
                            )
                        })}
                </div>
            </div>
        </div>
    )
}

export default Expenses