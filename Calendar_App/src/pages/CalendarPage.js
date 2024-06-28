import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const fetchAppointments = async () => {
    const { data } = await axios.get('http://localhost:5000/appointments');
    return data;
};

const CalendarPage = () => {
    const { logout } = useAuth();
    const queryClient = useQueryClient();
    const { data: appointments, isLoading } = useQuery('appointments', fetchAppointments);
    const [newAppointment, setNewAppointment] = useState({ name: '', date: '', status: 'Pending'});
    const [filterStatus, setFilterStatus] = useState('');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');

    const addAppointmentMutation = useMutation(
        (appointment) => axios.post('http://localhost:5000/appointments', appointment),
        {
            onSuccess: () => queryClient.invalidateQueries('appointments'),
        }
    );
}