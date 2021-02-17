import React, {useReducer, useCallback, useMemo, useEffect} from 'react';
import useHttp from "../../hooks/http";

import IngredientForm from './IngredientForm';
import IngredientList from "./IngredientList";
import Search from './Search';
import ErrorModal from "../UI/ErrorModal";

const ingredientReducer = (currentIngredients, action) => {
	switch (action.type) {
		case 'SET':
			return action.ingredients
		case 'ADD':
			return [...currentIngredients, action.ingredient]
		case 'DELETE':
			return currentIngredients.filter(ing => ing.id !== action.id)
		default:
			throw new Error('Should not get here')
	}
}

function Ingredients() {
	const [ingredients, dispatch] = useReducer(ingredientReducer, [])
	const {isLoading, error, data, sendRequest, reqExtra, reqIdentifier, clear} = useHttp()

	// if no extra params are passed it acts like componentDidUpdate and it runs every time the component is updated
	useEffect(() => {
		if (!isLoading && reqIdentifier === 'REMOVE_INGREDIENT' && !error) {
			dispatch({type: 'DELETE', id: reqExtra})
		} else if (!isLoading && reqIdentifier === 'ADD_INGREDIENT' && !error) {
			dispatch({type: 'ADD', ingredient: {id: data.name, ...reqExtra}})
		}
	}, [data, reqExtra, reqIdentifier, isLoading, error])

	const filterIngredientsHandler = useCallback(filteredIngredients => {
		dispatch({type: 'SET', ingredients: filteredIngredients})
	}, [])

	const addIngredientHandler = useCallback(ingredient => {
		sendRequest('https://react-hooks-79b53-default-rtdb.firebaseio.com/ingredients.json', 'POST', JSON.stringify(ingredient), ingredient, 'ADD_INGREDIENT')
	}, [sendRequest])

	const removeIngredientHandler = useCallback(ingredientId => {
		sendRequest(`https://react-hooks-79b53-default-rtdb.firebaseio.com/ingredients/${ingredientId}.json`, 'DELETE', null, ingredientId, 'REMOVE_INGREDIENT')
	}, [sendRequest])

	const ingredientList = useMemo(() => <IngredientList ingredients={ingredients}
														 onRemoveItem={removeIngredientHandler}/>, [ingredients, removeIngredientHandler])

	return (
		<div className="App">
			{error && <ErrorModal onClose={clear}>{error}</ErrorModal>}
			<IngredientForm onAddIngredient={addIngredientHandler} loading={isLoading}/>

			<section>
				<Search onLoadIngredients={filterIngredientsHandler}/>
				{ingredientList}
			</section>
		</div>
	);
}

export default Ingredients;
