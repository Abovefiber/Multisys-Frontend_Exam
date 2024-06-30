import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const fetchappointment = async () => {
    const { data } = await axios.get('http://localhost:3000/appointment');
    return data;
};

const CalendarPage = () => {
    const { logout } = useAuth();
    const queryClient = useQueryClient();
    const { data: appointment, isLoading } = useQuery('appointment', fetchappointment);
    const [newAppointment, setNewAppointment] = useState({ name: '', date: '', status: 'Pending'});
    const [filterStatus, setFilterStatus] = useState('');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');

    const addAppointmentMutation = useMutation(
        (appointment) => axios.post('http://localhost:3000/appointment', appointment),
        {
            onSuccess: () => queryClient.invalidateQueries('appointment'),
        }
    );

    const deleteAppointmentMutation = useMutation(
        (id) => axios.delete('http://localhost:3000/appointment/${id}'),
        {
            onSuccess: () => queryClient.invalidateQueries('appointment'),
        }
    );

    const updateAppointmentMutation = useMutation(
        (appointment) => axios.put('http://localhost:3000/appointment/${appointment.id}', appointment),
        {
            onSuccess: () => queryClient.invalidateQueries('appointment'),
        }
    );

    const handleAppointment = (e) => {
        e.preventDefault();
        addAppointmentMutation.mutate(newAppointment);
        setNewAppointment({ name: '', date: '', status: 'Pending' });
    };

    const handleToggleStatus = (appointment) => {
        updateAppointmentMutation.mutate({ ...appointment, status: appointment.status === 'Pending' ? 'Completed' : 'Pending' });
    };

    const handleDeleteAppointment = (id) => {
        if(window.confirm('Are you sure want to delete this appointment?')){
            deleteAppointmentMutation.mutate(id);
        }
    };

    const filteredAppointments = appointment
    .filter((appointment) => !filterStatus || appointment.status === filterStatus)
    .filter((appointment) => appointment.name.toLowerCase().includes(searchKeyword.toLowerCase()))
    .sort((a, b) => sortOrder === 'asc' ? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date));

    if(isLoading){
        return <div>Loading...</div>;
    }

    return (
        <div className="p-6">
          <button onClick={logout} className="bg-red-500 text-white p-2 rounded">Logout</button>
          <h1 className="text-2xl mb-4">Appointments</h1>
          <form onSubmit={handleAddAppointment} className="mb-4">
            <input
              type="text"
              placeholder="Name"
              className="p-2 border rounded mr-2"
              value={newAppointment.name}
              onChange={(e) => setNewAppointment({ ...newAppointment, name: e.target.value })}
            />
            <input
              type="date"
              className="p-2 border rounded mr-2"
              value={newAppointment.date}
              onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
            />
            <button type="submit" className="bg-blue-500 text-white p-2 rounded">Add Appointment</button>
          </form>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search by name"
              className="p-2 border rounded mr-2"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
            <select
              className="p-2 border rounded mr-2"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
            </select>
            <select
              className="p-2 border rounded"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="asc">Sort by Date Ascending</option>
              <option value="desc">Sort by Date Descending</option>
            </select>
          </div>
          <ul>
            {filteredAppointments.map((appointment) => (
              <li key={appointment.id} className="mb-2 p-2 border rounded flex justify-between items-center">
                <span>{appointment.name} - {appointment.date} - {appointment.status}</span>
                <div>
                  <button
                    onClick={() => handleToggleStatus(appointment)}
                    className={`p-2 rounded mr-2 ${appointment.status === 'Pending' ? 'bg-yellow-500' : 'bg-green-500'} text-white`}
                  >
                    Toggle Status
                  </button>
                  <button
                    onClick={() => handleDeleteAppointment(appointment.id)}
                    className="bg-red-500 text-white p-2 rounded"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      );
};

export default CalendarPage;